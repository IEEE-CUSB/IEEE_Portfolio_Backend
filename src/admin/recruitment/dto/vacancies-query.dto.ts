import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Society } from 'src/recruitment/enums/society.enum';

export class VacanciesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by vacancy title or description',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by vacancy category ID',
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ enum: Society, description: 'Filter by society' })
  @IsOptional()
  @IsEnum(Society)
  society?: Society;
}
