import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma.service';
import { JwtStrategy } from './jwt.strategy';

const expiresIn =
  process.env.JWT_EXPIRES_IN && /^\d+$/.test(process.env.JWT_EXPIRES_IN)
    ? Number(process.env.JWT_EXPIRES_IN)
    : 86400; // default 1 day = 86400 seconds

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn },
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
