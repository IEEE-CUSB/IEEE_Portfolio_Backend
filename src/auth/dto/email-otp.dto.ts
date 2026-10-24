import { IsEmail, IsNotEmpty, Length, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { STRING_MAX_LENGTH } from 'src/constants/variables';
import { NormalizeEmail } from 'src/decorators/normalize-email.decorator';

export class EmailOtpDTO {
  @ApiProperty({ example: 'user@example.com' })
  @NormalizeEmail()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(STRING_MAX_LENGTH)
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @Length(6, 6)
  otp!: string;
}
