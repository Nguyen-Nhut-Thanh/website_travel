import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Admin Methods ---

  async findAll() {
    return this.prisma.vouchers.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const voucher = await this.prisma.vouchers.findUnique({
      where: { voucher_id: id },
    });
    if (!voucher) throw new NotFoundException('Không tìm thấy voucher');
    return voucher;
  }

  async create(data: any) {
    const existing = await this.prisma.vouchers.findUnique({
      where: { code: data.code },
    });
    if (existing) throw new BadRequestException('Mã voucher này đã tồn tại');

    return this.prisma.vouchers.create({
      data: {
        code: data.code.toUpperCase(),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_value: data.min_order_value || 0,
        max_discount_amount: data.max_discount_amount,
        usage_limit: data.usage_limit || 100,
        start_date: new Date(data.start_date),
        expiry_date: new Date(data.expiry_date),
        status: data.status !== undefined ? Number(data.status) : 1,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.vouchers.update({
      where: { voucher_id: id },
      data: {
        code: data.code ? data.code.toUpperCase() : undefined,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_value: data.min_order_value,
        max_discount_amount: data.max_discount_amount,
        usage_limit: data.usage_limit,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
        status: data.status !== undefined ? Number(data.status) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.vouchers.delete({
      where: { voucher_id: id },
    });
  }

  // --- Public Methods ---

  async validateVoucher(code: string, orderAmount: number) {
    const voucher = await this.prisma.vouchers.findUnique({
      where: { code: code.toUpperCase(), status: 1 },
    });

    if (!voucher)
      throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn');

    const now = new Date();
    if (now < voucher.start_date)
      throw new BadRequestException('Mã giảm giá chưa đến thời gian sử dụng');
    if (now > voucher.expiry_date)
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    if (voucher.used_count >= voucher.usage_limit)
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
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
