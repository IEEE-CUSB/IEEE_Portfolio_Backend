import { IsOptional, IsBoolean, IsUUID, ValidateNested, IsArray, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STRING_MAX_LENGTH } from 'src/constants/variables';
import {
  IsHumanText,
  IsOptionalHumanText,
} from 'src/decorators/human-text.decorator';
import { QuestionType } from '../../../recruitment/entities/vacancy-question.entity';

export class VacancyQuestionDto {
  @ApiProperty({ example: 'What is your experience with NestJS?' })
  @IsHumanText({
    minLength: 1,
    maxLength: 1000,
    fieldLabel: 'question text',
  })
  question_text!: string;

  @ApiProperty({ enum: QuestionType, example: QuestionType.TEXT })
  @IsEnum(QuestionType)
  type!: QuestionType;

  @ApiPropertyOptional({ example: ['Option 1', 'Option 2'] })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order!: number;
}

export class CreateVacancyDto {
  @ApiProperty({ example: 'Backend Developer' })
  @IsHumanText({
    minLength: 6,
    maxLength: STRING_MAX_LENGTH,
    fieldLabel: 'title',
  })
  title!: string;

  @ApiPropertyOptional({ example: 'Develop and maintain backend services.' })
  @IsOptionalHumanText({
    minLength: 6,
    maxLength: 1000,
    fieldLabel: 'description',
  })
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_open?: boolean;

  @ApiPropertyOptional({ description: 'Category ID for the vacancy', example: 'uuid-string' })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({ type: () => [VacancyQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VacancyQuestionDto)
  @IsOptional()
  questions?: VacancyQuestionDto[];
}
