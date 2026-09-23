import type { Request, Response } from 'express';
import { Req,  
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
  UseInterceptors,
  ClassSerializerInterceptor,
  Delete,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiQuery,
  ApiProduces,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  ApiForbiddenErrorResponse,
  ApiInternalServerError,
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
} from '../../decorators/swagger-error-responses.decorator';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../constants/swagger-messages';
import { AdminRecruitmentService } from './admin-recruitment.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { VacanciesQueryDto } from './dto/vacancies-query.dto';
import { ApplicationsQueryDto } from './dto/applications-query.dto';
import { ResponseMessage } from '../../decorators/response-message.decorator';
// already imported from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  admin_create_vacancy_swagger,
  admin_update_vacancy_swagger,
  admin_get_vacancies_swagger,
  admin_get_applications_swagger,
  admin_update_application_status_swagger,
  admin_export_applications_swagger,
  admin_delete_vacancy_swagger,
  admin_view_application_cv_swagger,
} from './admin-recruitment.swagger';

@ApiTags('admin/recruitment')
@Controller('admin/recruitment')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class AdminRecruitmentController {
  constructor(
    private readonly adminRecruitmentService: AdminRecruitmentService,
  ) {}

  @Post('vacancies')
  @ApiOperation(admin_create_vacancy_swagger.operation)
  @ApiCreatedResponse(admin_create_vacancy_swagger.responses.success)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.VACANCY_CREATED)
  createVacancy(@Body() dto: CreateVacancyDto) {
    return this.adminRecruitmentService.createVacancy(dto);
  }

  @Patch('vacancies/:id')
  @ApiOperation(admin_update_vacancy_swagger.operation)
  @ApiOkResponse(admin_update_vacancy_swagger.responses.success)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.VACANCY_NOT_FOUND)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.VACANCY_UPDATED)
  updateVacancy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVacancyDto,
  ) {
    return this.adminRecruitmentService.updateVacancy(id, dto);
  }

  @Get('vacancies')
  @ApiOperation(admin_get_vacancies_swagger.operation)
  @ApiOkResponse(admin_get_vacancies_swagger.responses.success)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.VACANCIES_RETRIEVED)
  getVacancies(@Query() query: VacanciesQueryDto) {
    return this.adminRecruitmentService.getVacancies(query);
  }

  @Get('vacancies/:id/applications')
  @ApiOperation(admin_get_applications_swagger.operation)
  @ApiOkResponse(admin_get_applications_swagger.responses.success)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.VACANCY_NOT_FOUND)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.APPLICATIONS_RETRIEVED)
  getApplications(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Query() query: ApplicationsQueryDto,
  ) {
    return this.adminRecruitmentService.getApplications(vacancyId, query);
  }

  @Patch('applications/:id/status')
  @ApiOperation(admin_update_application_status_swagger.operation)
  @ApiOkResponse(admin_update_application_status_swagger.responses.success)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.APPLICATION_STATUS_UPDATED)
  updateApplicationStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.adminRecruitmentService.updateApplicationStatus(id, dto.status);
  }

  @Get('vacancies/:id/applications/export/excel')
  @ApiOperation(admin_export_applications_swagger.operation)
  @ApiOkResponse(admin_export_applications_swagger.responses.success)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.VACANCY_NOT_FOUND)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async exportApplicationsToExcel(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const file = await this.adminRecruitmentService.exportApplicationsToExcel(
      vacancyId,
      startDate,
      endDate,
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    });

    res.send(file.fileBuffer);
  }

  @Delete('vacancies/:id')
  @ApiOperation(admin_delete_vacancy_swagger.operation)
  @ApiOkResponse(admin_delete_vacancy_swagger.responses.success)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.VACANCY_NOT_FOUND)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.VACANCY_DELETED)
  deleteVacancy(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminRecruitmentService.deleteVacancy(id);
  }

  @Post('vacancies/:id/image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload vacancy image' })
  @ApiCreatedResponse({ description: 'Image uploaded successfully' })
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.VACANCY_NOT_FOUND)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.IMAGE_UPLOADED)
  uploadVacancyImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() image: any,
  ) {
    return this.adminRecruitmentService.uploadVacancyImage(id, image);
  }

  @Delete('vacancies/:id/image')
  @ApiOperation({ summary: 'Remove vacancy image' })
  @ApiOkResponse({ description: 'Image removed successfully' })
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.VACANCY_NOT_FOUND)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.IMAGE_DELETED)
  removeVacancyImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminRecruitmentService.removeVacancyImage(id);
  }

  @Get('applications/:id/cv')
  @ApiOperation(admin_view_application_cv_swagger.operation)
  @ApiProduces('application/pdf', 'application/octet-stream')
  @ApiOkResponse(admin_view_application_cv_swagger.responses.success)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  async viewApplicationCv(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const file = await this.adminRecruitmentService.getApplicationCv(id);
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `inline; filename="CV.pdf"`,
    });
    res.send(file.fileBuffer);
  }

  @Get('file/download')
  @ApiOperation({ summary: 'Download/View an application file' })
  @ApiOkResponse({ description: 'File downloaded successfully' })
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACTION)
  async downloadApplicationFile(
    @Query('key') fileKey: string,
    @Res() res: Response,
  ) {
    if (!fileKey) {
      return res.status(400).json({ message: 'File key is required' });
    }
    return this.adminRecruitmentService.downloadApplicationFile(fileKey, res);
  }
}
