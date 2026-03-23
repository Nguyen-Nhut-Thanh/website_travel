import { Controller, Post, Get, Body, Req, Query, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-url')
  @UseGuards(JwtAuthGuard)
  async createPaymentUrl(@Body() body: { bookingId: number; amount: number }, @Req() req: any) {
    if (!body.bookingId || !body.amount) {
      throw new BadRequestException('Missing bookingId or amount');
    }
    
    // Lấy IP của client
    let ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress || 
                 req.connection.socket.remoteAddress;

    // Fix IPv6 localhost format for testing
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
      ipAddr = '127.0.0.1';
    }
    
    // Ensure ipAddr is a string
    if (Array.isArray(ipAddr)) {
        ipAddr = ipAddr[0];
    }

    return this.paymentService.createPaymentUrl(body.bookingId, body.amount, ipAddr);
  }

  // Webhook cho VNPay gọi ngầm cập nhật trạng thái
  @Get('vnpay-ipn')
  async vnpayIpn(@Query() query: any, @Res() res: any) {
    const result = await this.paymentService.verifyIpn(query);
    // VNPay yêu cầu trả về theo định dạng này
    return res.status(200).json(result);
  }

  // Xử lý khi VNPay redirect user trở về web
  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any, @Res() res: any) {
    const result = await this.paymentService.verifyIpn(query);
    
    // Bạn có thể redirect user về một trang kết quả trên Frontend
    const frontendUrl = process.env.NEXT_PUBLIC_API_BASE 
      ? process.env.NEXT_PUBLIC_API_BASE.replace(':4000', ':3000') 
      : 'http://localhost:3000';
      
    if (result.RspCode === '00' && result.Message === 'Confirm Success') {
      return res.redirect(`${frontendUrl}/booking/result?status=success&orderId=${query.vnp_TxnRef.split('_')[0]}`);
    } else {
      return res.redirect(`${frontendUrl}/booking/result?status=failed&orderId=${query.vnp_TxnRef.split('_')[0]}`);
    }
  }
}
