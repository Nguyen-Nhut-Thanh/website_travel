//apps/api/src/modules/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

function cookieExtractor(req: any): string | null {
  return req?.cookies?.admin_token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, // ✅ đọc từ cookie
        ExtractJwt.fromAuthHeaderAsBearerToken(), // (optional) vẫn support Bearer
      ]),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
