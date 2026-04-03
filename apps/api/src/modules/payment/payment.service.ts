import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../../prisma.service';

type VnpQuery = Record<string, string>;

@Injectable()
export class PaymentService {
  private tmnCode = process.env.VNP_TMN_CODE;
  private hashSecret = process.env.VNP_HASH_SECRET;
  private vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private apiBaseUrl =
    process.env.API_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    'https://api.nhutthanh.id.vn';
  private returnUrl = `${this.apiBaseUrl.replace(/\/+$/, '')}/payment/vnpay-return`;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private sortObject(obj: Record<string, string | number>) {
    const sorted: Record<string, string | number> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  createPaymentUrl(bookingId: number, amount: number, ipAddr: string) {
    if (!this.tmnCode || !this.hashSecret) {
      throw new Error('VNPay configuration is missing in .env file');
    }

    const date = new Date();
    const createDate =
      date.getFullYear() +
      `0${date.getMonth() + 1}`.slice(-2) +
      `0${date.getDate()}`.slice(-2) +
      `0${date.getHours()}`.slice(-2) +
      `0${date.getMinutes()}`.slice(-2) +
      `0${date.getSeconds()}`.slice(-2);

    const vnpParams: Record<string, string | number> = {
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

    const sortedParams = this.sortObject(vnpParams);
    const signData = Object.keys(sortedParams)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(sortedParams[key])).replace(/%20/g, '+')}`,
      )
      .join('&');

    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const queryParams = Object.keys(sortedParams)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(sortedParams[key])).replace(/%20/g, '+')}`,
      )
      .join('&');

    const paymentUrl = `${this.vnpUrl}?${queryParams}&vnp_SecureHash=${signed}`;
    return { paymentUrl };
  }

  async verifyIpn(query: Record<string, string | string[] | undefined>) {
    if (!this.hashSecret) {
      return { RspCode: '99', Message: 'Missing HashSecret' };
    }

    const normalizedQuery: VnpQuery = Object.fromEntries(
      Object.entries(query)
        .filter(([, value]) => typeof value === 'string')
        .map(([key, value]) => [key, value as string]),
    );

    const secureHash = normalizedQuery.vnp_SecureHash;
    delete normalizedQuery.vnp_SecureHash;
    delete normalizedQuery.vnp_SecureHashType;

    const sortedParams = this.sortObject(normalizedQuery);
    const signData = Object.keys(sortedParams)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(sortedParams[key])).replace(/%20/g, '+')}`,
      )
      .join('&');

    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      return { RspCode: '97', Message: 'Invalid Checksum' };
    }

    const orderId = normalizedQuery.vnp_TxnRef?.split('_')[0];
    const rspCode = normalizedQuery.vnp_ResponseCode;
    if (!orderId) {
      return { RspCode: '01', Message: 'Order not found' };
    }

    const booking = await this.prisma.bookings.findUnique({
      where: { booking_id: Number(orderId) },
      include: {
        tour_schedules: {
          include: {
            tours: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!booking) return { RspCode: '01', Message: 'Order not found' };
    if (booking.status === 'paid') {
      return { RspCode: '02', Message: 'Order already confirmed' };
    }

    if (rspCode !== '00') {
      return { RspCode: '00', Message: 'Success' };
    }

    await this.prisma.bookings.update({
      where: { booking_id: Number(orderId) },
      data: { status: 'paid' },
    });

    await this.prisma.payments.create({
      data: {
        booking_id: Number(orderId),
        amount: booking.total_amount,
        method: 'vnpay',
        status: 'completed',
        transaction_code: normalizedQuery.vnp_TransactionNo,
      },
    });

    await this.mailService.sendBookingPaidEmail({
      email: booking.contact_email,
      contactName: booking.contact_name,
      bookingId: booking.booking_id,
      tourName: booking.tour_schedules?.tours?.name || 'Tour',
      totalAmount: Number(booking.total_amount),
    });

    return { RspCode: '00', Message: 'Confirm Success' };
  }
}
