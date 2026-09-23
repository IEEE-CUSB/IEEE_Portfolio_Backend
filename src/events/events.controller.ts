import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { EventsService } from './events.service';
import {
  ApiBadRequestErrorResponse,
  ApiConflictErrorResponse,
  ApiInternalServerError,
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
} from 'src/decorators/swagger-error-responses.decorator';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from 'src/constants/swagger-messages';
import {
  cancel_event_registration_swagger,
  get_all_events_swagger,
  get_event_by_id_swagger,
  register_event_swagger,
} from './events.swagger';
import { ResponseMessage } from 'src/decorators/response-message.decorator';
import { User } from 'src/users/entities/user.entity';
import { OptionalJwtGuard } from 'src/auth/guards/optional-jwt.guard';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  @ApiOperation(get_all_events_swagger.operation)
  @ApiOkResponse(get_all_events_swagger.responses.success)
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
    description: 'Filter by event category ID',
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
    return this.eventsService.findAll(
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
  @ApiBearerAuth()
  @ApiOperation(get_event_by_id_swagger.operation)
  @ApiOkResponse(get_event_by_id_swagger.responses.success)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.EVENT_NOT_FOUND)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user?: User },
  ) {
    return this.eventsService.findOne(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/register')
  @ApiBearerAuth()
  @ApiOperation(register_event_swagger.operation)
  @ApiOkResponse(register_event_swagger.responses.success)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiBadRequestErrorResponse(ERROR_MESSAGES.EVENT_REGISTRATION_CLOSED)
  @ApiConflictErrorResponse(ERROR_MESSAGES.EVENT_ALREADY_REGISTERED)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.EVENT_NOT_FOUND)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.EVENT_REGISTERED)
  register(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.eventsService.register(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation(cancel_event_registration_swagger.operation)
  @ApiOkResponse(cancel_event_registration_swagger.responses.success)
  @ApiUnauthorizedErrorResponse(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN)
  @ApiNotFoundErrorResponse(ERROR_MESSAGES.EVENT_REGISTRATION_NOT_FOUND)
  @ApiInternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
  @ResponseMessage(SUCCESS_MESSAGES.EVENT_REGISTRATION_CANCELLED)
  cancelRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.eventsService.cancelRegistration(id, req.user);
  }
}
