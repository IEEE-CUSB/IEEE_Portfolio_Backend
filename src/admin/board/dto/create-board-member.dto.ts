import { IsEmail, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { STRING_MAX_LENGTH } from 'src/constants/variables';
import { IsHumanText } from 'src/decorators/human-text.decorator';

export class CreateBoardMemberDto {
  @ApiProperty({
    description: 'Board member name',
    example: 'Mario Raafat',
  })
  @IsHumanText({
    minLength: 2,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'name',
  })
  name!: string;

  @ApiProperty({
    description: 'Board member email',
    example: 'mario.raafat@ieee.org',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Board member role',
    example: 'Chair & Vice Chair',
  })
  @IsHumanText({
    minLength: 2,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'role',
  })
  role!: string;

  @ApiProperty({
    description: 'Display order (optional)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  display_order?: number;

  @ApiProperty({
    description: 'Bio (optional)',
    example: 'A brief bio',
    required: false,
  })
  @IsOptional()
  @IsHumanText({
    minLength: 2,
    maxLength: 1000,
    fieldLabel: 'bio',
  })
  bio?: string;

  @ApiProperty({
    description: 'LinkedIn URL (optional)',
    required: false,
  })
  @IsOptional()
  linkedin?: string;

  @ApiProperty({
    description: 'GitHub URL (optional)',
    required: false,
  })
  @IsOptional()
  github?: string;

  @ApiProperty({
    description: 'Twitter URL (optional)',
    required: false,
  })
  @IsOptional()
  twitter?: string;
}
