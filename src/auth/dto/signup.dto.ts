import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
export class SignupOtpDto {
  @IsEmail({}, { message: 'Invalid Email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @IsOptional()
  @Matches(/^\+\d{12}$/, {
    message: 'Mobile number must be in the format +91<10-digit-number>',
  })
  mobile?: string;
}
