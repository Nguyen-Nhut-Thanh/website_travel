import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  private getSystemEmail() {
    return process.env.MAIL_INTERNAL_EMAIL || process.env.MAIL_USER || '';
  }

  private formatCurrency(value: number | string) {
    return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
  }

  private formatDate(value?: string | Date | null) {
    if (!value) return 'Đang cập nhật';
    return new Date(value).toLocaleDateString('vi-VN');
  }

  private formatDateTime(value?: string | Date | null) {
    if (!value) return 'Đang cập nhật';
    return new Date(value).toLocaleString('vi-VN');
  }

  private renderLayout(title: string, intro: string, body: string, footer?: string) {
    return `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 640px; margin: 0 auto; padding: 24px;">
        <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
          <div style="padding: 24px 24px 8px;">
            <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b;">
              Travol
            </p>
            <h2 style="margin: 0 0 12px; font-size: 24px; color: #0f172a;">${title}</h2>
            <p style="margin: 0; color: #334155;">${intro}</p>
          </div>
          <div style="padding: 16px 24px 8px;">${body}</div>
          <div style="padding: 8px 24px 24px; color: #475569; font-size: 14px;">
            <p style="margin: 0;">
              ${footer || 'Nếu cần hỗ trợ thêm, vui lòng phản hồi email này hoặc liên hệ đội ngũ Travol.'}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private renderInfoCard(lines: Array<[label: string, value: string]>, tone: 'neutral' | 'success' | 'warning' = 'neutral') {
    const theme =
      tone === 'success'
        ? { background: '#f0fdf4', border: '#bbf7d0' }
        : tone === 'warning'
          ? { background: '#fff7ed', border: '#fdba74' }
          : { background: '#f8fafc', border: '#e2e8f0' };

    return `
      <div style="background: ${theme.background}; border: 1px solid ${theme.border}; border-radius: 12px; padding: 16px; margin: 0 0 16px;">
        ${lines
          .map(
            ([label, value]) => `
              <p style="margin: 0 0 8px;">
                <strong>${label}:</strong> ${value}
              </p>
            `,
          )
          .join('')}
      </div>
    `;
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    html: string;
  }) {
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Travel V2'}" <${process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER}>`,
      ...options,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`[MAIL] Sent "${options.subject}" to ${options.to}`);
    } catch (error) {
      this.logger.error('[MAIL] Send error', error);
    }
  }

  async sendVerificationEmail(email: string, code: string) {
    await this.sendMail({
      to: email,
      subject: 'Xác thực tài khoản Travol',
      html: this.renderLayout(
        'Xác thực tài khoản',
        'Cảm ơn bạn đã đăng ký. Vui lòng nhập mã xác thực bên dưới để hoàn tất tạo tài khoản.',
        `
          <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 16px;">
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #0f172a;">${code}</div>
          </div>
          <p style="margin: 0;">Mã có hiệu lực trong 15 phút. Nếu bạn không thực hiện yêu cầu này, có thể bỏ qua email.</p>
        `,
      ),
    });
  }

  async sendBookingCreatedEmail(params: {
    email: string;
    contactName: string;
    bookingId: number;
    tourName: string;
    startDate?: string | Date | null;
    totalAmount: number | string;
  }) {
    await this.sendMail({
      to: params.email,
      subject: `Đã ghi nhận booking #${params.bookingId}`,
      html: this.renderLayout(
        `Xin chào ${params.contactName || 'quý khách'},`,
        'Booking của bạn đã được tạo thành công và đang chờ thanh toán.',
        `
          ${this.renderInfoCard(
            [
              ['Mã booking', `#${params.bookingId}`],
              ['Tour', params.tourName],
              ['Khởi hành', this.formatDate(params.startDate)],
              ['Tổng thanh toán', this.formatCurrency(params.totalAmount)],
              ['Trạng thái', 'Chờ thanh toán'],
            ],
            'neutral',
          )}
          <p style="margin: 0;">Bạn có thể kiểm tra chi tiết và hoàn tất thanh toán trong mục tài khoản của mình.</p>
        `,
      ),
    });
  }

  async sendBookingPaidEmail(params: {
    email: string;
    contactName: string;
    bookingId: number;
    tourName: string;
    totalAmount: number | string;
  }) {
    await this.sendMail({
      to: params.email,
      subject: `Thanh toán thành công cho booking #${params.bookingId}`,
      html: this.renderLayout(
        `Xin chào ${params.contactName || 'quý khách'},`,
        'Chúng tôi đã xác nhận khoản thanh toán của bạn.',
        `
          ${this.renderInfoCard(
            [
              ['Mã booking', `#${params.bookingId}`],
              ['Tour', params.tourName],
              ['Số tiền', this.formatCurrency(params.totalAmount)],
              ['Trạng thái', 'Đã thanh toán'],
            ],
            'success',
          )}
          <p style="margin: 0;">Travol sẽ tiếp tục cập nhật các thông tin cần thiết cho chuyến đi của bạn.</p>
        `,
      ),
    });
  }

  async sendCancelRequestEmail(params: {
    email: string;
    contactName: string;
    bookingId: number;
    tourName: string;
  }) {
    await this.sendMail({
      to: params.email,
      subject: `Đã nhận yêu cầu hủy booking #${params.bookingId}`,
      html: this.renderLayout(
        `Xin chào ${params.contactName || 'quý khách'},`,
        'Chúng tôi đã ghi nhận yêu cầu hủy tour của bạn và đang chờ bộ phận vận hành xử lý.',
        `
          ${this.renderInfoCard(
            [
              ['Mã booking', `#${params.bookingId}`],
              ['Tour', params.tourName],
              ['Trạng thái', 'Đang chờ xử lý yêu cầu hủy'],
            ],
            'warning',
          )}
          <p style="margin: 0;">Kết quả xử lý và thông tin hoàn tiền, nếu có, sẽ được gửi tới bạn trong email tiếp theo.</p>
        `,
      ),
    });
  }

  async sendCancelRequestAdminNotification(params: {
    bookingId: number;
    tourName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string | null;
    reason?: string;
  }) {
    const systemEmail = this.getSystemEmail();
    if (!systemEmail) return;

    await this.sendMail({
      to: systemEmail,
      subject: `Yêu cầu hủy mới cho booking #${params.bookingId}`,
      html: this.renderLayout(
        'Có yêu cầu hủy booking mới',
        'Hệ thống vừa ghi nhận một yêu cầu hủy từ khách hàng. Vui lòng kiểm tra và xử lý sớm.',
        this.renderInfoCard(
          [
            ['Mã booking', `#${params.bookingId}`],
            ['Tour', params.tourName],
            ['Khách hàng', params.contactName],
            ['Email', params.contactEmail],
            ['Số điện thoại', params.contactPhone || 'Chưa cập nhật'],
            ['Lý do', params.reason || 'Khách chưa cung cấp lý do'],
          ],
          'warning',
        ),
        'Email này được gửi tự động để hỗ trợ đội ngũ vận hành theo dõi yêu cầu hủy tour.',
      ),
    });
  }

  async sendCancelApprovedEmail(params: {
    email: string;
    contactName: string;
    bookingId: number;
    tourName: string;
  }) {
    await this.sendMail({
      to: params.email,
      subject: `Yêu cầu hủy booking #${params.bookingId} đã được duyệt`,
      html: this.renderLayout(
        `Xin chào ${params.contactName || 'quý khách'},`,
        'Yêu cầu hủy booking của bạn đã được phê duyệt.',
        `
          ${this.renderInfoCard(
            [
              ['Mã booking', `#${params.bookingId}`],
              ['Tour', params.tourName],
              ['Trạng thái', 'Đã hủy'],
            ],
            'neutral',
          )}
          <p style="margin: 0;">Nếu có khoản hoàn tiền, đội ngũ Travol sẽ liên hệ hoặc cập nhật cho bạn theo chính sách áp dụng.</p>
        `,
      ),
    });
  }

  async sendCancelRejectedEmail(params: {
    email: string;
    contactName: string;
    bookingId: number;
    tourName: string;
  }) {
    await this.sendMail({
      to: params.email,
      subject: `Yêu cầu hủy booking #${params.bookingId} chưa được chấp nhận`,
      html: this.renderLayout(
        `Xin chào ${params.contactName || 'quý khách'},`,
        'Hiện tại yêu cầu hủy booking của bạn chưa được phê duyệt.',
        `
          ${this.renderInfoCard(
            [
              ['Mã booking', `#${params.bookingId}`],
              ['Tour', params.tourName],
              ['Trạng thái', 'Tiếp tục giữ chỗ'],
            ],
            'neutral',
          )}
          <p style="margin: 0;">Nếu cần thêm hỗ trợ, bạn có thể liên hệ bộ phận chăm sóc khách hàng để được hướng dẫn.</p>
        `,
      ),
    });
  }

  async sendScheduleUpdatedEmail(params: {
    email: string;
    contactName: string;
    bookingId: number;
    tourName: string;
    oldStartDate?: string | Date | null;
    newStartDate?: string | Date | null;
    oldEndDate?: string | Date | null;
    newEndDate?: string | Date | null;
  }) {
    await this.sendMail({
      to: params.email,
      subject: `Lịch khởi hành booking #${params.bookingId} đã được cập nhật`,
      html: this.renderLayout(
        `Xin chào ${params.contactName || 'quý khách'},`,
        'Chúng tôi xin thông báo lịch khởi hành của tour bạn đã đặt vừa được điều chỉnh.',
        `
          ${this.renderInfoCard(
            [
              ['Mã booking', `#${params.bookingId}`],
              ['Tour', params.tourName],
              ['Khởi hành cũ', this.formatDateTime(params.oldStartDate)],
              ['Khởi hành mới', this.formatDateTime(params.newStartDate)],
              ['Kết thúc cũ', this.formatDateTime(params.oldEndDate)],
              ['Kết thúc mới', this.formatDateTime(params.newEndDate)],
            ],
            'warning',
          )}
          <p style="margin: 0;">Vui lòng kiểm tra lại kế hoạch di chuyển của bạn. Nếu cần hỗ trợ, đội ngũ Travol luôn sẵn sàng hỗ trợ.</p>
        `,
      ),
    });
  }
}
