import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Max,
  MaxLength,
  MinLength,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STRING_MAX_LENGTH } from 'src/constants/variables';
import { Type } from 'class-transformer';
import { IsHumanText } from 'src/decorators/human-text.decorator';
import { NormalizeEmail } from 'src/decorators/normalize-email.decorator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from 'src/constants/password';

export class RegisterDTO {
  @ApiProperty({ description: 'User email', example: 'wagih123@gmail.com' })
  @NormalizeEmail()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(STRING_MAX_LENGTH)
  email!: string;

  @ApiProperty({ description: 'Username', example: 'AhmedWaGiiH' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(STRING_MAX_LENGTH)
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message:
      'username may only contain letters, numbers, dots, and underscores',
  })
  username!: string;

  @ApiProperty({ description: 'Full name', example: 'Ahmed Wagih' })
  @IsHumanText({
    minLength: 2,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'name',
  })
  name!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+20-100-123-4567',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber(undefined, { message: 'Phone number must be valid' })
  phone!: string;

  @ApiProperty({ description: 'Faculty', example: 'Engineering' })
  @IsHumanText({
    minLength: 2,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'faculty',
  })
  faculty!: string;

  @ApiProperty({ description: 'University', example: 'Cairo University' })
  @IsHumanText({
    minLength: 2,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'university',
  })
  university!: string;

  @ApiProperty({
    description: 'Academic year',
    example: 3,
    minimum: 1,
    maximum: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  academic_year!: number;

  @ApiPropertyOptional({ description: 'Major', example: 'Computer Science' })
  @IsHumanText({
    minLength: 2,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'major',
  })
  major?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional PDF CV file',
  })
  cv?: any;

  @ApiProperty({
    description: 'Password',
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
    description: 'Confirm password',
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
