import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

function cookieExtractor(req: any): string | null {
  return req?.cookies?.admin_token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    if (!process.env.JWT_SECRET) {
      console.warn(
        '[AUTH] Warning: JWT_SECRET is not defined in .env, using fallback secret.',
      );
    }
  }

  async validate(payload: any) {
    // Trả về dữ liệu user từ payload để NestJS gán vào req.user
    return {
      sub: payload.sub,
      email: payload.email,
      accountId: payload.accountId,
      isStaff: payload.isStaff,
    };
  }
}
