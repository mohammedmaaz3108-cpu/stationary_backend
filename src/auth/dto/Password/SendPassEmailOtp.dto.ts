import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendPassEmailOtpDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
