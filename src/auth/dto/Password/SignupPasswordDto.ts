import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumberString,
  Length,
  Validate,
} from 'class-validator';

export class SignupPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required.' })
  fullName: string;

  @IsEmail({}, { message: 'Invalid email address.' })
  email: string;

  @IsString()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters.' })
  password: string;

  @IsNumberString({}, { message: 'OTP must be a number string.' })
  @IsNotEmpty({ message: 'OTP is required.' })
  otp: string;

  @IsNumberString({}, { message: 'OTP must be a number string.' })
  @IsNotEmpty({ message: 'OTP is required.' })
  mobile: string;
}
