import { IsInt, IsNotEmpty, IsEnum, Min, Max, IsArray, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { STRING_MAX_LENGTH } from 'src/constants/variables';
import { AwardSource } from 'src/awards/enums/award-source.enum';
import { IsHumanText } from 'src/decorators/human-text.decorator';

export class CreateAwardDto {
  @ApiProperty({
    description: 'Award title',
    example: 'Best Technical Chapter',
  })
  @IsHumanText({
    minLength: 6,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'title',
  })
  title!: string;

  @ApiProperty({
    description: 'Award description',
    example: 'Awarded for outstanding chapter performance and activities.',
  })
  @IsHumanText({ minLength: 6, maxLength: 1000, fieldLabel: 'description' })
  description!: string;

  @ApiProperty({
    description: 'Years the award was won',
    example: [2025, 2024],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(1900, { each: true })
  @Max(new Date().getFullYear() + 1, { each: true })
  years!: number[];

  @ApiProperty({
    description: 'Optional details per year',
    example: { '2025': '1st place' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, string>;

  @ApiProperty({
    description: 'Source of the award',
    enum: AwardSource,
    example: AwardSource.GLOBAL,
  })
  @IsEnum(AwardSource)
  @IsNotEmpty()
  source!: AwardSource;

  @ApiProperty({
    description: 'How many times this award was won',
    example: 3,
  })
  @IsInt()
  @Min(0)
  won_count!: number;
}
