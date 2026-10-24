import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { STRING_MAX_LENGTH } from 'src/constants/variables';
import { NormalizeEmail } from 'src/decorators/normalize-email.decorator';

export class GenerateOtpDTO {
  @ApiProperty({
    description: 'Email address to generate OTP for',
    example: 'user@example.com',
  })
  @NormalizeEmail()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(STRING_MAX_LENGTH)
  email!: string;
}
