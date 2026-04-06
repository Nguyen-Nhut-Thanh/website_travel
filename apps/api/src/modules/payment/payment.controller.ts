import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Query,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import type {
  PaymentCreateUrlBody,
  PaymentVerifyQuery,
} from './payment.types';

type RequestWithForwardedIp = Request & {
  connection: Request['socket'] & {
    socket?: Request['socket'];
  };
};

function normalizeClientIp(req: RequestWithForwardedIp) {
  let ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress;

  if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
    ipAddr = '127.0.0.1';
  }

  if (Array.isArray(ipAddr)) {
    return ipAddr[0];
  }

  return ipAddr || '127.0.0.1';
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-url')
  @UseGuards(JwtAuthGuard)
  async createPaymentUrl(
    @Body() body: PaymentCreateUrlBody,
    @Req() req: RequestWithForwardedIp,
  ) {
    if (!body.bookingId || !body.amount) {
      throw new BadRequestException('Missing bookingId or amount');
    }

    return this.paymentService.createPaymentUrl(
      body.bookingId,
      body.amount,
      normalizeClientIp(req),
    );
  }

  @Get('vnpay-ipn')
  async vnpayIpn(
    @Query() query: PaymentVerifyQuery,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.verifyIpn(query);
    return res.status(200).json(result);
  }

  @Get('vnpay-return')
  async vnpayReturn(
    @Query() query: PaymentVerifyQuery,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.verifyIpn(query);
    const frontendUrl = (
      process.env.FRONTEND_PUBLIC_URL || 'https://nhutthanh.id.vn'
    ).replace(/\/+$/, '');
    const orderId = String(query.vnp_TxnRef || '').split('_')[0];

    if (result.RspCode === '00' && result.Message === 'Confirm Success') {
      return res.redirect(
        `${frontendUrl}/booking/result?status=success&orderId=${orderId}`,
      );
    }

    return res.redirect(
      `${frontendUrl}/booking/result?status=failed&orderId=${orderId}`,
    );
  }
}
