import {
  IsEmail,
  IsNotEmpty,
  Length,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { STRING_MAX_LENGTH } from 'src/constants/variables';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from 'src/constants/password';

export class ResetPasswordDTO {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(STRING_MAX_LENGTH)
  email!: string;

  @ApiProperty({
    description: 'OTP code (6 digits)',
    example: '123456',
  })
  @IsNotEmpty()
  @Length(6, 6)
  otp!: string;

  @ApiProperty({
    description: 'New password',
    minLength: 8,
    example: 'StrongPassw0rd!',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(STRING_MAX_LENGTH)
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_MESSAGE,
  })
  password!: string;

  @ApiProperty({
    description: 'Confirm new password',
    minLength: 8,
    example: 'StrongPassw0rd!',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(STRING_MAX_LENGTH)
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_MESSAGE,
  })
  confirmPassword!: string;
}
