import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { VoucherPayload } from './vouchers.types';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureExists(id: number) {
    const voucher = await this.prisma.vouchers.findUnique({
      where: { voucher_id: id },
    });

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return voucher;
  }

  private normalizeCode(code?: string) {
    return code?.trim().toUpperCase();
  }

  private normalizePayload(data: VoucherPayload) {
    return {
      code: data.code ? this.normalizeCode(data.code) : undefined,
      discount_type: data.discount_type,
      discount_value:
        data.discount_value !== undefined ? Number(data.discount_value) : undefined,
      min_order_value:
        data.min_order_value !== undefined && data.min_order_value !== null
          ? Number(data.min_order_value)
          : undefined,
      max_discount_amount:
        data.max_discount_amount !== undefined && data.max_discount_amount !== null
          ? Number(data.max_discount_amount)
          : undefined,
      usage_limit:
        data.usage_limit !== undefined && data.usage_limit !== null
          ? Number(data.usage_limit)
          : undefined,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
      status: data.status !== undefined ? Number(data.status) : undefined,
    };
  }

  async findAll() {
    return this.prisma.vouchers.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.ensureExists(id);
  }

  async create(data: VoucherPayload) {
    const payload = this.normalizePayload(data);
    const existing = await this.prisma.vouchers.findUnique({
      where: { code: payload.code },
    });

    if (existing) {
      throw new BadRequestException('Mã voucher này đã tồn tại');
    }

    return this.prisma.vouchers.create({
      data: {
        code: payload.code!,
        discount_type: payload.discount_type!,
        discount_value: payload.discount_value!,
        min_order_value: payload.min_order_value ?? 0,
        max_discount_amount: payload.max_discount_amount,
        usage_limit: payload.usage_limit ?? 100,
        start_date: payload.start_date!,
        expiry_date: payload.expiry_date!,
        status: payload.status ?? 1,
      },
    });
  }

  async update(id: number, data: VoucherPayload) {
    await this.ensureExists(id);
    const payload = this.normalizePayload(data);

    if (payload.code) {
      const existing = await this.prisma.vouchers.findUnique({
        where: { code: payload.code },
      });

      if (existing && existing.voucher_id !== id) {
        throw new BadRequestException('Mã voucher này đã tồn tại');
      }
    }

    return this.prisma.vouchers.update({
      where: { voucher_id: id },
      data: payload,
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);

    return this.prisma.vouchers.delete({
      where: { voucher_id: id },
    });
  }

  async validateVoucher(code: string, orderAmount: number) {
    const voucher = await this.prisma.vouchers.findUnique({
      where: { code: code.toUpperCase(), status: 1 },
    });

    if (!voucher) {
      throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }

    const now = new Date();
    if (now < voucher.start_date) {
      throw new BadRequestException('Mã giảm giá chưa đến thời gian sử dụng');
    }
    if (now > voucher.expiry_date) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }
    if (voucher.used_count >= voucher.usage_limit) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }
    if (orderAmount < Number(voucher.min_order_value)) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${Number(voucher.min_order_value).toLocaleString()}đ để sử dụng mã này`,
      );
    }

    let discountAmount = 0;
    if (voucher.discount_type === 'percentage') {
      discountAmount = orderAmount * (Number(voucher.discount_value) / 100);
      if (
        voucher.max_discount_amount &&
        discountAmount > Number(voucher.max_discount_amount)
      ) {
        discountAmount = Number(voucher.max_discount_amount);
      }
    } else {
      discountAmount = Number(voucher.discount_value);
    }

    return {
      voucher_id: voucher.voucher_id,
      code: voucher.code,
      discount_amount: discountAmount,
    };
  }
}
