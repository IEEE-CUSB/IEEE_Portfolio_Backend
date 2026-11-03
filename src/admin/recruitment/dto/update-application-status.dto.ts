import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    example: 'ACCEPTED',
  })
  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED'])
  @IsNotEmpty()
  status!: 'PENDING' | 'ACCEPTED' | 'REJECTED';

  @ApiPropertyOptional({
    description: 'Optional custom message to include in the decision email',
    example: 'Looking forward to meeting you at our upcoming orientation session!',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

