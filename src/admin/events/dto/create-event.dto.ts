import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsUUID, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STRING_MAX_LENGTH } from 'src/constants/variables';
import { IsHumanText } from 'src/decorators/human-text.decorator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title',
    example: 'IEEE AI Workshop',
  })
  @IsHumanText({
    minLength: 6,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'title',
  })
  title!: string;

  @ApiProperty({
    description: 'Event description',
    example: 'A hands-on workshop on AI fundamentals and applications.',
  })
  @IsHumanText({ minLength: 6, maxLength: 1000, fieldLabel: 'description' })
  description!: string;

  @ApiProperty({
    description: 'Event category',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  category_id!: string;

  @ApiProperty({
    description: 'Event location',
    example: 'Main Auditorium, Building B',
  })
  @IsHumanText({
    minLength: 3,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'location',
  })
  location!: string;

  @ApiProperty({
    description: 'Event start time (ISO 8601)',
    example: '2026-03-15T10:00:00Z',
  })
  @IsDateString()
  start_time!: string;

  @ApiProperty({
    description: 'Event end time (ISO 8601)',
    example: '2026-03-15T12:00:00Z',
  })
  @IsDateString()
  end_time!: string;

  @ApiProperty({
    description: 'Maximum number of attendees',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({
    description: 'Registration deadline (ISO 8601)',
    example: '2026-03-10T23:59:59Z',
  })
  @IsDateString()
  registration_deadline!: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the event is publicly visible' })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}
