import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
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
      console.log(`[MAIL] Sent "${options.subject}" to ${options.to}`);
    } catch (error) {
      console.error('[MAIL] Send error:', error);
    }
  }

  async sendVerificationEmail(email: string, code: string) {
    await this.sendMail({
      to: email,
      subject: 'Xác thực tài khoản của bạn',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px; margin: auto;">
          <h2 style="color: #333; text-align: center;">Chào mừng bạn đến với Travel V2</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã xác nhận bên dưới:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff; border-radius: 4px; margin: 20px 0;">
            ${code}
          </div>
          <p>Mã này sẽ hết hạn sau 15 phút.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
      `,
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
      subject: `Đặt tour thành công - Mã booking #${params.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2>Xin chào ${params.contactName || 'quý khách'},</h2>
          <p>Hệ thống đã ghi nhận booking của bạn thành công.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
            <p><strong>Mã booking:</strong> #${params.bookingId}</p>
            <p><strong>Tên tour:</strong> ${params.tourName}</p>
            <p><strong>Ngày khởi hành:</strong> ${params.startDate ? new Date(params.startDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</p>
            <p><strong>Tổng thanh toán:</strong> ${Number(params.totalAmount).toLocaleString('vi-VN')}đ</p>
            <p><strong>Trạng thái:</strong> Chưa thanh toán</p>
          </div>
          <p>Bạn có thể theo dõi và thanh toán trong mục tài khoản của mình.</p>
        </div>
      `,
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
      subject: `Đã thanh toán booking #${params.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2>Xin chào ${params.contactName || 'quý khách'},</h2>
          <p>Chúng tôi đã ghi nhận thanh toán thành công cho booking của bạn.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
            <p><strong>Mã booking:</strong> #${params.bookingId}</p>
            <p><strong>Tên tour:</strong> ${params.tourName}</p>
            <p><strong>Số tiền:</strong> ${Number(params.totalAmount).toLocaleString('vi-VN')}đ</p>
            <p><strong>Trạng thái:</strong> Đã thanh toán</p>
          </div>
        </div>
      `,
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
      subject: `Đã ghi nhận yêu cầu hủy booking #${params.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2>Xin chào ${params.contactName || 'quý khách'},</h2>
          <p>Chúng tôi đã ghi nhận yêu cầu hủy tour của bạn.</p>
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:16px 0;">
            <p><strong>Mã booking:</strong> #${params.bookingId}</p>
            <p><strong>Tên tour:</strong> ${params.tourName}</p>
            <p><strong>Trạng thái:</strong> Đang chờ xử lý yêu cầu hủy</p>
          </div>
          <p>Phí hủy tour và số tiền hoàn sẽ được thông báo sau, căn cứ theo chính sách chuyển/hủy tour của chương trình.</p>
        </div>
      `,
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
      subject: `Có yêu cầu hủy mới cho booking #${params.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2>Yêu cầu hủy booking mới</h2>
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:16px 0;">
            <p><strong>Mã booking:</strong> #${params.bookingId}</p>
            <p><strong>Tên tour:</strong> ${params.tourName}</p>
            <p><strong>Khách hàng:</strong> ${params.contactName}</p>
            <p><strong>Email:</strong> ${params.contactEmail}</p>
            <p><strong>Số điện thoại:</strong> ${params.contactPhone || 'Chưa cập nhật'}</p>
            <p><strong>Lý do:</strong> ${params.reason || 'Khách chưa nhập lý do'}</p>
          </div>
        </div>
      `,
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
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2>Xin chào ${params.contactName || 'quý khách'},</h2>
          <p>Yêu cầu hủy booking của bạn đã được duyệt.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
            <p><strong>Mã booking:</strong> #${params.bookingId}</p>
            <p><strong>Tên tour:</strong> ${params.tourName}</p>
            <p><strong>Trạng thái:</strong> Đã hủy</p>
          </div>
          <p>Nếu có khoản hoàn tiền, đội ngũ điều hành sẽ liên hệ và xử lý theo chính sách của tour.</p>
        </div>
      `,
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
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2>Xin chào ${params.contactName || 'quý khách'},</h2>
          <p>Yêu cầu hủy booking của bạn hiện chưa được chấp nhận.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
            <p><strong>Mã booking:</strong> #${params.bookingId}</p>
            <p><strong>Tên tour:</strong> ${params.tourName}</p>
          </div>
          <p>Vui lòng liên hệ bộ phận chăm sóc khách hàng nếu cần thêm hỗ trợ.</p>
        </div>
      `,
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
    const formatDateTime = (value?: string | Date | null) => {
      if (!value) return 'Đang cập nhật';
      return new Date(value).toLocaleString('vi-VN');
    };

    await this.sendMail({
      to: params.email,
      subject: `Lịch khởi hành tour #${params.bookingId} đã được cập nhật`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2>Xin chào ${params.contactName || 'quý khách'},</h2>
          <p>Chúng tôi xin thông báo lịch khởi hành của tour bạn đã đặt vừa được cập nhật.</p>
          <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:16px;margin:16px 0;">
            <p><strong>Mã booking:</strong> #${params.bookingId}</p>
            <p><strong>Tên tour:</strong> ${params.tourName}</p>
            <p><strong>Khởi hành cũ:</strong> ${formatDateTime(params.oldStartDate)}</p>
            <p><strong>Khởi hành mới:</strong> ${formatDateTime(params.newStartDate)}</p>
            <p><strong>Kết thúc cũ:</strong> ${formatDateTime(params.oldEndDate)}</p>
            <p><strong>Kết thúc mới:</strong> ${formatDateTime(params.newEndDate)}</p>
          </div>
          <p>Vui lòng kiểm tra lại kế hoạch di chuyển của bạn. Nếu cần hỗ trợ, hãy liên hệ với chúng tôi sớm nhất để được hỗ trợ.</p>
        </div>
      `,
    });
  }
}
