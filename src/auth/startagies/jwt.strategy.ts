import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

const extractCustomToken = (req: any) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authHeader;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // ✅ Ensure secret is always defined
    const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_ACCESS_TOKEN_SECRET is not defined in environment variables.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractCustomToken]),
      ignoreExpiration: false,
      secretOrKey: secret, // ✅ definite string
    });
  }

  async validate(payload: any) {
    const login = await this.authService.getLoginByUserId({
      userId: payload.sub,
      authId: payload.auth_id,
    });

    if (!login) {
      throw new UnauthorizedException(
        'Token malformed or Session expired, please login again to continue.',
      );
    }

    if (!login.user || !login.user.is_active) {
      throw new ForbiddenException(
        'Please contact our support team or your admin to continue.',
      );
    }

    return {
      sub: payload.sub,
      auth_id: payload.auth_id,
      email: payload.email,
    };
  }
}
