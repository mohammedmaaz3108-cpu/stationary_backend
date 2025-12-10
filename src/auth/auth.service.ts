import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Op, where } from 'sequelize';
import { NodeMailerService } from 'src/common/node-mailer/node-mailer.service';
import { TrackActivityService } from 'src/common/track-activity/track-activity.service';
import { TransactionService } from 'src/common/transaction/transaction.service';
import { v4 as uuidv4 } from 'uuid';
import { ModelsService } from 'src/common/models/models.service';
import { generateUIDUtil } from 'src/utils/generate-uid.util';
import { OtpEmailVerificationMailContent } from 'src/utils/mail-templates/otp-email-verification-mail-content';
import { generateOtp } from 'src/utils/otp-generator.util';
import { generateReferralCodeUtil } from 'src/utils/referral-code.util';
import { errorResponse, successResponse } from 'src/utils/responseUtil';
import { SignupOtpDto } from './dto/signup.dto';
import { SendPassEmailOtpDto } from './dto/Password/SendPassEmailOtp.dto';
import { SignupPasswordDto } from './dto/Password/SignupPasswordDto';
import * as bcrypt from 'bcrypt';
import { CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Send } from 'express';
import { access } from 'fs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('MODELS') private readonly models: any,
    private jwtService: JwtService,
    private readonly modelsService: ModelsService,
    private readonly transactionService: TransactionService,
    // private readonly twilioService: TwilioService,
    private readonly nodeMailerService: NodeMailerService,
    private readonly trackActivityService: TrackActivityService,
  ) {}

  async sendOtp(
    res: any,
    { email, mobile }: { email?: string; mobile?: string },
  ): Promise<any> {
    let otp: string;
    otp = generateOtp();

    const expiryTime = email ? 600 : 300;

    if (mobile) {
      //   const success = await this.twilioService.sendOtp(mobile, otp);
      //   if (!success)
      //     throw new BadRequestException('Error sending OTP via phone.');
    }

    if (email) {
      const { subject, text, html } = OtpEmailVerificationMailContent({ otp });
      await this.nodeMailerService.sendMail({ to: email, subject, text, html });
    }

    const record = await this.modelsService.createDataService(
      this.models.prjModels.LoginRequests,
      {
        [email ? 'email' : 'phone']: email || mobile,
        otp,
        expires_in: new Date(Date.now() + expiryTime * 1000),
      },
    );

    return res
      .setHeader('x-PUQ', record.id)
      .setHeader('Access-Control-Expose-Headers', 'x-PUQ')
      .status(HttpStatus.OK)
      .json(successResponse(HttpStatus.OK, null, 'OTP sent successfully.'));
  }
  //sendOtpMaaz
  async sendOtpMaaz(res: any, { email }: { email: string }): Promise<any> {
    let otp: string;
    otp = generateOtp();
    // console.log(otp);
    const expiryTime = 600;

    if (email) {
      const { subject, text, html } = OtpEmailVerificationMailContent({ otp });
      await this.nodeMailerService.sendMail({ to: email, subject, text, html });
    }
    const record = await this.modelsService.createDataService(
      this.models.prjModels.LoginRequests,
      {
        email,
        otp,
        expires_in: new Date(Date.now() + expiryTime * 1000),
      },
    );
    return res
      .setHeader('X-PUQ', record.id)
      .setHeader('Access-Central_Expose_Headers', 'x-PUQ')
      .status(HttpStatus.OK)
      .json(
        successResponse(HttpStatus.OK, null, 'Otp sent successfully by maaz'),
      );
  }

  async login(req: any) {
    if (!req?.user_exists) {
      return successResponse(
        HttpStatus.OK,
        { is_exists: false },
        'OTP verified successfully',
      );
    } else {
      const authId = uuidv4();
      const transaction = await this.transactionService.runInTransaction(
        'prjModels',
        async (t) => {
          const createLogin = await this.modelsService.createDataService(
            this.models.prjModels.Logins,
            {
              auth_id: authId,
              userId: req.user.id,
            },
            // t,
          );

          if (!createLogin) {
            throw new BadRequestException('Failed to login, please try again!');
          }

          await this.modelsService.createDataService(
            this.models.prjModels.LoginRecords,
            {
              auth_id: authId,
              userId: req.user.id,
            },
            // t,
          );

          await this.trackActivityService.log({
            userId: req.user.id,
            event_type: 'login',
            event_time: new Date(),
            sequelizeTransaction: t,
          });

          return createLogin;
        },
      );

      if (!transaction) {
        throw new BadRequestException('Failed to login, please try again!');
      }

      const payload = {
        sub: req.user.id,
        email: req.user.email,
        auth_id: authId,
      };
      return successResponse(
        200,
        { token: this.jwtService.sign(payload) },
        'Login successfully',
      );
    }
  }

  //Loginbymaaz

  async getLoginByUserId({ userId, authId }: any) {
    const login = await this.modelsService.getDataService(
      this.models.prjModels.Logins,
      {
        where: { userId, auth_id: authId },
        include: [
          {
            model: this.models.prjModels.Users,
            attributes: ['id', 'is_active'],
          },
        ],
      },
    );

    if (!login) {
      return null;
    }
    return login;
  }

  async validateUser(
    req: any,
    { email, mobile, otp }: { email?: string; mobile?: string; otp: string },
  ): Promise<any> {
    const verifyId = req.headers['id'];

    let record: any = null;

    if (email) {
      record = await this.modelsService.getDataService(
        this.models.prjModels.LoginRequests,
        { where: { email, id: verifyId, otp } },
      );
    }
    if (mobile) {
      record = await this.modelsService.getDataService(
        this.models.prjModels.LoginRequests,
        { where: { phone: mobile, id: verifyId, otp } },
      );
    }

    if (!record) {
      return { otp_exists: false };
    }

    // Safe conversion
    record =
      record && typeof record.toJSON === 'function'
        ? record.toJSON()
        : { ...record };

    if (record?.is_processed) {
      return { otp_exists: true, otp_processed: true };
    }

    if (record?.expires_in < new Date()) {
      return { otp_exists: true, otp_expired: true };
    }

    const whereCondition = record.email
      ? { email: record.email }
      : { mobile: record.phone };

    if (whereCondition?.mobile) {
      whereCondition.mobile = {
        [Op.or]: [
          whereCondition.mobile,
          whereCondition.mobile.replace('+91', ''),
        ],
      };
    }

    const user = await this.modelsService.getDataService(
      this.models.prjModels.Users,
      {
        where: whereCondition,
        attributes: ['id', 'email', 'mobile', 'is_active'],
      },
    );

    if (!user) {
      await this.modelsService.updateDataService(
        this.models.prjModels.LoginRequests,
        record.id,
        { is_processed: true, type: 1 },
      );

      return { otp_exists: true, user_exists: false };
    }

    return {
      otp_exists: true,
      user_exists: true,
      user: typeof user.toJSON === 'function' ? user.toJSON() : { ...user },
    };
  }

  async signupOtpAuth(verifyId: string, dto: SignupOtpDto) {
    const { username, email, mobile } = dto;

    const loginRequest = await this.modelsService.getDataService(
      this.models.prjModels.LoginRequests,
      {
        where: {
          [Op.or]: [{ email }, { phone: mobile }],
          id: verifyId,
          createdAt: {
            [Op.gt]: new Date(Date.now() - 30 * 60 * 1000),
          },
          is_processed: true,
          type: 1,
        },
      },
    );

    if (!loginRequest) {
      return errorResponse(
        HttpStatus.BAD_REQUEST,
        'error',
        'OTP verification is required. Invalid verification request.',
      );
    }

    const isAlreadyExists = await this.modelsService.getAllDataService(
      this.models.prjModels.Users,
      {
        where: {
          [Op.or]: [{ email }, { mobile }],
        },
      },
    );
    if (isAlreadyExists && isAlreadyExists.length) {
      return errorResponse(HttpStatus.CONFLICT, 'error', 'User already exists');
    }

    const transaction = await this.transactionService.runInTransaction(
      'prjModels',
      async (t) => {
        const code = await generateReferralCodeUtil(this.models);

        const userPayload: any = {
          name: username,
          email,
          mobile,
          referral_code: code,
        };
        const user = await this.modelsService.createDataService(
          this.models.prjModels.Users,
          userPayload,
          // t,
        );

        if (!user) {
          throw new BadRequestException('User creation failed');
        }

        const auth_id = generateUIDUtil();
        const payload = {
          sub: user.id,
          email: user.email,
          auth_id,
        };

        const token = this.jwtService.sign(payload);

        await this.modelsService.createDataService(
          this.models.prjModels.Logins,
          {
            auth_id,
            userId: user.id,
          },
          // t,
        );

        await this.modelsService.createDataService(
          this.models.prjModels.LoginRecords,
          {
            auth_id,
            userId: user.id,
          },
        );
        return { token };
      },
    );

    if (!transaction) {
      throw new BadRequestException('Signup failed, please try again!');
    }

    return successResponse(HttpStatus.OK, transaction, 'Signup successfully');
  }

  //Password section

  async sendPasswordOtpForSignup({ email }: SendPassEmailOtpDto) {
    const otp = generateOtp();
    const expiryTime = 600; // 10 minutes
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const existingRequest = await this.modelsService.getDataService(
      this.models.prjModels.LoginRequests,
      {
        where: {
          email: email,
          type: 2,
        },
      },
    );
    // Prevent resending within 1 minute
    if (existingRequest && existingRequest.updatedAt > oneMinuteAgo) {
      throw new BadRequestException(
        'OTP already sent. Please wait a minute before requesting again.',
      );
    }

    // Create or update OTP record
    let record;
    if (existingRequest) {
      await this.models.prjModels.LoginRequests.update(
        {
          otp,
          expires_in: new Date(Date.now() + expiryTime * 1000),
          is_processed: false,
          updatedAt: new Date(Date.now()),
        },
        {
          where: { email: email, type: 2 },
        },
      );
    } else {
      await this.modelsService.createDataService(
        this.models.prjModels.LoginRequests,
        {
          email,
          otp,
          type: 2,
          expires_in: new Date(Date.now() + expiryTime * 1000),
        },
      );
    }

    // Send OTP mail
    const { subject, text, html } = OtpEmailVerificationMailContent({
      otp: otp.toString(),
    });

    await this.nodeMailerService.sendMail({
      to: email,
      subject,
      text,
      html,
    });
    return successResponse(HttpStatus.OK, null, 'OTP sent successfully.');
  }

  async passwordSignup({
    fullName,
    email,
    password,
    otp,
    mobile,
  }: SignupPasswordDto) {
    const otpRequest = await this.modelsService.getDataService(
      this.models.prjModels.LoginRequests,
      {
        where: {
          email,
          otp,
          is_processed: false,
          type: 2,
        },
      },
    );

    if (!otpRequest) throw new BadRequestException('Invalid OTP provided');

    const now = new Date();
    const otpExpiry = new Date(otpRequest.updatedAt.getTime() + 10 * 60 * 1000);
    if (now > otpExpiry) throw new BadRequestException('OTP expired');

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await this.transactionService.runInTransaction(
      'prjModels',
      async (transaction) => {
        // Create User
        const user = await this.modelsService.createDataService(
          this.models.prjModels.Users,
          {
            name: fullName,
            email: email.toLowerCase(),
            password: hashPassword,
            mobile,
          },
          transaction,
        );
        if (!user) throw new BadRequestException('User creation failed');

        // Mark OTP as processed
        await this.modelsService.updateDataService(
          this.models.prjModels.LoginRequests,
          otpRequest.id,
          { is_processed: true },
          transaction,
        );

        // Log user creation
        await this.trackActivityService.log({
          userId: user.id,
          event_type: 'signup',
          event_time: new Date(),
          sequelizeTransaction: transaction,
        });

        // Send Welcome Email
        await this.nodeMailerService.sendMail({
          to: email,
          subject: 'Welcome to Our Platform!',
          html: `<p>Hello ${fullName} thank you for logging in our app and welcome!</p>`,
          text: `Hello ${fullName} thank you for logging in our app and welcome!`,
        });

        return user;
      },
    );

    if (!result)
      throw new BadRequestException('Signup failed, please try again.');

    return successResponse(
      HttpStatus.CREATED,
      { message: 'Signup successfully' },
      'Signup successfully',
    );
  }

  // async otpForPassword({ email }: SendPassEmailOtpDto) {
  //   const otp = generateOtp();
  //   const expiryTime = 600;
  //   const oneMintAgo = new Date(Date.now() - 60 * 1000);

  //   const existingRequest = await this.modelsService.getDataService(
  //     this.models.prjModels.LoginRequests,
  //     {
  //       where: { email: email, type: 2 },
  //     },
  //   );

  //   if (existingRequest && existingRequest.updatedAt > oneMintAgo)
  //     throw new BadRequestException(
  //       'Please wait for a one minute to send it again',
  //     );

  //   let record;
  //   if (existingRequest) {
  //     await this.models.prjModels.LoginRequests.update(
  //       {
  //         otp,
  //         is_processed: false,
  //         expires_in: new Date(Date.now() + expiryTime * 1000),
  //         updatedAt: new Date(Date.now()),
  //       },
  //       { where: { email: email, type: 2 } },
  //     );
  //   } else {
  //     await this.modelsService.createDataService(
  //       this.models.prjModels.LoginRequests,
  //       {
  //         otp,
  //         is_processed: false,
  //         expires_in: new Date(Date.now() + expiryTime * 1000),
  //         type: 2,
  //       },
  //     );
  //   }

  //   //send mail
  //   const { subject, text, html } = OtpEmailVerificationMailContent({
  //     otp: otp.toString(),
  //   });
  //   await this.nodeMailerService.sendMail({
  //     to: email,
  //     subject,
  //     text,
  //     html,
  //   });

  //   return successResponse(HttpStatus.OK, null, 'Otp sent successfully');
  // }

  // async passwordOtpSignUp({
  //   email,
  //   fullName,
  //   password,
  //   otp,
  //   mobile,
  // }: SignupPasswordDto) {
  //   const otpRequest = await this.modelsService.getDataService(
  //     this.models.prjModels.LoginRequests,
  //     { where: { otp, email, is_processed: false, type: 2 } },
  //   );
  //   if (!otpRequest) throw new BadRequestException('Otp invalid');

  //   const now = new Date();
  //   const otpExpire = new Date(otpRequest.updatedAt.getTime() + 60 * 1000);
  //   if (now > otpExpire) throw new BadRequestException('Otp Expired');

  //   const hashPassword = await bcrypt.hash(password, 10);

  //   const result = await this.transactionService.runInTransaction(
  //     'prjModles',
  //     async (transaction) => {
  //       const user = await this.modelsService.createDataService(
  //         this.models.prjModels.Users,
  //         {
  //           name: fullName,
  //           password: hashPassword,
  //           email: email.toLowerCase(),
  //           mobile,
  //         },
  //         transaction,
  //       );
  //       if (!user) throw new BadRequestException('user creation failed');

  //       await this.modelsService.updateDataService(
  //         this.models.prjModels.LoginRequests,
  //         otpRequest.id,
  //         { is_processed: false },
  //         transaction,
  //       );

  //       await this.nodeMailerService.sendMail({
  //         to: email,
  //         subject: 'Welcome to our platform',
  //         text: `Hello ${fullName} this is mazzz, welcome aboard!`,
  //         html: `<p>Hello ${fullName} this is maaz, welcome aboard!</p>`,
  //       });
  //       return user;
  //     },
  //   );
  //   if (!result) throw new BadRequestException('signup failed try again');

  //   return successResponse(
  //     HttpStatus.CREATED,
  //     { message: 'successfully signup' },
  //     'successfully signup by maaz',
  //   );
  // }

  async validateUserPwd({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await this.modelsService.getDataService(
      this.models.prjModels.Users,
      {
        where: { email },
        attributes: { include: ['password'] },
      },
    );

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    delete user.password;

    return user;
  }

  async passwordLogin(req: any) {
    const authId = uuidv4();
    console.log(',.mnbv');
    const transaction = await this.transactionService.runInTransaction(
      'prjModels',
      async (transaction) => {
        const createLogin = await this.modelsService.createDataService(
          this.models.prjModels.Logins,
          {
            auth_id: authId,
            userId: req.user.id,
          },
          transaction,
        );
        if (!createLogin) {
          throw new BadRequestException('Failed to login, please try again!');
        }

        await this.trackActivityService.log({
          userId: req.user.id,
          event_type: 'login',
          event_time: new Date(),
          sequelizeTransaction: transaction,
        });

        return createLogin;
      },
    );

    if (!transaction) {
      throw new BadRequestException('Failed to login, please try again!');
    }
    const payload = {
      sub: req.user.id,
      email: req.user.email,
      authId,
    };

    return successResponse(
      200,
      {
        access_token: this.jwtService.sign(payload),
        user: {
          id: req.user.id,
          fullName: req.user.fullName,
          email: req.user.email,
        },
      },
      'Login successfully',
    );
  }
}
