import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { EventDto } from './dto/eventDto';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService, //
  ) {}

  @Post()
  async eventDistributor(@Body(ValidationPipe) eventDto: EventDto) {
    return this.eventService.eventDistributor(eventDto);
  }
}
