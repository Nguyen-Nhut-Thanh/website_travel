import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Travel V2'}" <${process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER}>`,
      to: email,
      subject: 'Xác thực tài khoản của bạn',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px; margin: auto;">
          <h2 style="color: #333; text-align: center;">Chào mừng bạn đến với Travel V2!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất việc đăng ký, vui lòng sử dụng mã xác nhận bên dưới:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff; border-radius: 4px; margin: 20px 0;">
            ${code}
          </div>
          <p>Mã này sẽ hết hạn sau 15 phút.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            Đây là email tự động, vui lòng không phản hồi. &copy; 2026 Travel V2.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`[MAIL] Đã gửi mã xác nhận đến ${email}`);
    } catch (error) {
      console.error('[MAIL] Lỗi gửi mail:', error);
      // throw error; // Không nên throw nếu muốn quy trình đăng ký vẫn tiếp tục nhưng mail lỗi, 
      // Tuy nhiên, ở đây ta muốn thực sự gửi mail nên ta có thể để nó báo lỗi.
    }
  }
}
