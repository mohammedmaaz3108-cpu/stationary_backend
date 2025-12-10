import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionService } from 'src/common/transaction/transaction.service';
import { NodeMailerModule } from 'src/common/node-mailer/node-mailer.module';
import { LocalStrategy } from './startagies/local.strategy';
import { JwtStrategy } from './startagies/jwt.strategy';
import { TrackActivityService } from 'src/common/track-activity/track-activity.service';

@Module({
  imports: [
    NodeMailerModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => {
        const secret =
          configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
          'defaultSecret';
        const expiresIn =
          configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '3600s';

        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    TransactionService,
    LocalStrategy,
    JwtStrategy,
    TrackActivityService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
