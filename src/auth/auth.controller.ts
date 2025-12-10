import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignupOtpDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SendPassEmailOtpDto } from './dto/Password/SendPassEmailOtp.dto';
import { SignupPasswordDto } from './dto/Password/SignupPasswordDto';
import { AuthGuard } from '@nestjs/passport';
import { successResponse } from 'src/utils/responseUtil';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Res() res: Response, @Body() body: any): Promise<any> {
    return this.authService.sendOtp(res, body);
  }
  //doneByMaaz
  @Public()
  @Post('send-otp-maaz')
  @HttpCode(HttpStatus.OK)
  async sendOtpMaaz(@Res() res: Response, @Body() body: any): Promise<any> {
    return this.authService.sendOtpMaaz(res, body);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    delete req.user.otp_exists;
    req.user_exists = req.user.user_exists;
    delete req.user.user_exists;
    req.user = req.user.user;
    return this.authService.login(req);
  }

  //verifybymaaz
  // @Public()
  // @UseGuards(LocalAuthGuard)
  // @Post('verify-otp-maaz')
  // @HttpCode(HttpStatus.OK)
  // async loginMaaz(@Request() req) {
  //   delete req.user.otp_exists;
  //   req.user_exists = req.user.user_exists;
  //   delete req.user.user_exists;
  //   req.user = req.user.user;
  //   return this.authService.loginMaaz(req);
  // }

  @Post('signup')
  async signupOtpAuth(
    @Headers('id') verifyId: string,
    @Body() dto: SignupOtpDto,
  ) {
    return this.authService.signupOtpAuth(verifyId, dto);
  }

  @Public()
  @Post('password/sendOTP')
  async sendPasswordOtpForSignup(@Body() body: SendPassEmailOtpDto) {
    return await this.authService.sendPasswordOtpForSignup(body);
  }

  @Public()
  @Post('password/signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: SignupPasswordDto) {
    return this.authService.passwordSignup(body);
  }

  // @Public()
  // @Post('password-sendotp')
  // async otpForPassword(@Body() body: SendPassEmailOtpDto) {
  //   return this.authService.otpForPassword(body);
  // }

  // @Public()
  // @Post('password-signup')
  // @HttpCode(HttpStatus.CREATED)
  // async passwordOtpSignUp(@Body() body: SignupPasswordDto) {
  //   return this.authService.passwordOtpSignUp(body);
  // }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('password/login')
  @HttpCode(HttpStatus.OK)
  async passwordLogin(@Request() req) {
    return this.authService.passwordLogin(req);
  }
}
