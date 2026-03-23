import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PaymentService {
  private tmnCode = process.env.VNP_TMN_CODE;
  private hashSecret = process.env.VNP_HASH_SECRET;
  private vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private returnUrl = process.env.NEXT_PUBLIC_API_BASE 
    ? `${process.env.NEXT_PUBLIC_API_BASE}/payment/vnpay-return`
    : 'http://localhost:4000/payment/vnpay-return';

  constructor(private prisma: PrismaService) {}

  // Hàm sắp xếp tham số chuẩn VNPay
  private sortObject(obj: Record<string, any>) {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  async createPaymentUrl(bookingId: number, amount: number, ipAddr: string) {
    if (!this.tmnCode || !this.hashSecret) {
      throw new Error('VNPay configuration is missing in .env file');
    }

    const date = new Date();
    const createDate = 
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);

    const vnp_Params: Record<string, any> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: `${bookingId}_${date.getTime()}`,
      vnp_OrderInfo: `Thanh toan don hang ${bookingId}`,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(amount * 100),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // 1. Sắp xếp tham số
    const sortedParams = this.sortObject(vnp_Params);

    // 2. Tạo chuỗi dữ liệu băm (Phải dùng encodeURIComponent chuẩn VNPay)
    const signData = Object.keys(sortedParams)
      .map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, "+")}`;
      })
      .join("&");

    // 3. Băm dữ liệu bằng HMAC-SHA512
    const hmac = crypto.createHmac('sha512', this.hashSecret as string);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex'); 
    
    // 4. Tạo URL cuối cùng (Chữ ký phải nằm cuối)
    const queryParams = Object.keys(sortedParams)
      .map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, "+")}`;
      })
      .join("&");

    const paymentUrl = `${this.vnpUrl}?${queryParams}&vnp_SecureHash=${signed}`;

    return { paymentUrl };
  }

  async verifyIpn(query: any) {
    if (!this.hashSecret) return { RspCode: '99', Message: 'Missing HashSecret' };

    const vnp_Params = { ...query };
    const secureHash = vnp_Params['vnp_SecureHash'];
    
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnp_Params);
    
    // Tạo lại chuỗi dữ liệu băm từ query trả về để đối chiếu
    const signData = Object.keys(sortedParams)
      .map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, "+")}`;
      })
      .join("&");

    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');     

    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef'].split('_')[0];
      const rspCode = vnp_Params['vnp_ResponseCode'];
      
      const booking = await this.prisma.bookings.findUnique({
        where: { booking_id: Number(orderId) }
      });

      if (!booking) return { RspCode: '01', Message: 'Order not found' };
      if (booking.status === 'paid') return { RspCode: '02', Message: 'Order already confirmed' };

      if (rspCode === '00') {
        await this.prisma.bookings.update({
          where: { booking_id: Number(orderId) },
          data: { status: 'paid' }
        });
        
        await this.prisma.payments.create({
            data: {
                booking_id: Number(orderId),
                amount: booking.total_amount,
                method: 'vnpay',
                status: 'completed',
                transaction_code: vnp_Params['vnp_TransactionNo']
            }
        });
        
        return { RspCode: '00', Message: 'Confirm Success' };
      }
      return { RspCode: '00', Message: 'Success' };
    }
    return { RspCode: '97', Message: 'Invalid Checksum' };
  }
}
