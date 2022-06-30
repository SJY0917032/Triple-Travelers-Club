import {
  Body,
  Controller,
  HttpCode,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Point } from '../point/entities/point.entity';
import { EventDto } from './dto/eventDto';
import { EventService } from './event.service';

@ApiTags('Event')
@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService, //
  ) {}

  /**
   * @author SJY0917032
   * @description
   *
   * EventDto를 사용해 이벤트를 분리하며
   * 분리된 이벤트에 따른 포인트를 부여합니다
   */
  @Post()
  @ApiOperation({
    summary: '이벤트 호출',
    description: '이벤트를 호출하며, 이벤트에 맞는 포인트를 부여합니다',
  })
  @ApiBody({ type: EventDto })
  @ApiCreatedResponse({
    description: '이벤트의 성공 여부',
    type: [Point],
  })
  @ApiBadRequestResponse({
    description: '이벤트 실패',
    schema: {
      example: '해당 유저가 존재하지 않습니다.',
    },
  })
  async eventDistributor(@Body(ValidationPipe) eventDto: EventDto) {
    const result = await this.eventService.eventDistributor(eventDto);

    return { code: 201, message: '이벤트가 완료됐습니다.', data: { result } };
  }
}
