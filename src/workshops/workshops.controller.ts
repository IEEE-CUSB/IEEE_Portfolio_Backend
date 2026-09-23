import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { WorkshopsService } from './workshops.service';
import {
  ApiBadRequestErrorResponse,
  ApiConflictErrorResponse,
  ApiForbiddenErrorResponse,
  ApiInternalServerError,
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/decorators/swagger-error-responses.decorator';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from 'src/constants/swagger-messages';
import { User } from 'src/users/entities/user.entity';
import { OptionalJwtGuard } from 'src/auth/guards/optional-jwt.guard';
import { CvUploadedGuard } from 'src/auth/guards/cv-uploaded.guard';
import { ResponseMessage } from 'src/decorators/response-message.decorator';
import {
  get_all_workshops_swagger,
  get_workshop_by_id_swagger,
  register_workshop_swagger,
  cancel_workshop_registration_swagger,
} from './workshops.swagger';

@ApiTags('workshops')
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiOperation(get_all_workshops_swagger.operation)
  @ApiOkResponse(get_all_workshops_swagger.responses.success)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by title or description',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    type: String,
    description: 'Filter by category ID',
  })
  findAll(
    @Req() req: Request & { user?: User },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('category_id') category_id?: string,
    @Query('include_unpublished') include_unpublished?: string,
  ) {
    return this.workshopsService.findAll(
      parseInt(page),
      parseInt(limit),
      req.user,
      search,
      location,
      category_id,
      include_unpublished === 'true',
    );
  }

  @Get(':id')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation(get_workshop_by_id_swagger.operation)
  @ApiOkResponse(get_workshop_by_id_swagger.responses.success)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.WORKSHOP_NOT_FOUND)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user?: User },
  ) {
    return this.workshopsService.findOne(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'), CvUploadedGuard)
  @Post(':id/register')
  @ApiBearerAuth()
  @ApiOperation(register_workshop_swagger.operation)
  @ApiCreatedResponse(register_workshop_swagger.responses.success)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiForbiddenErrorResponse(ERROR_MESSAGES.CV_REQUIRED)
  @ApiBadRequestErrorResponse(ERROR_MESSAGES.WORKSHOP_REGISTRATION_CLOSED)
  @ApiConflictErrorResponse(ERROR_MESSAGES.WORKSHOP_ALREADY_REGISTERED)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.WORKSHOP_NOT_FOUND)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.WORKSHOP_REGISTERED)
  register(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.workshopsService.register(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation(cancel_workshop_registration_swagger.operation)
  @ApiOkResponse(cancel_workshop_registration_swagger.responses.success)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiBadRequestErrorResponse(
    ERROR_MESSAGES.WORKSHOP_REGISTRATION_CANNOT_BE_CANCELLED,
  )
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.WORKSHOP_REGISTRATION_NOT_FOUND)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.WORKSHOP_REGISTRATION_CANCELLED)
  cancelRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.workshopsService.cancelRegistration(id, req.user);
  }
}
