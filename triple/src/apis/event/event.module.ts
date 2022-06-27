import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Point } from '../point/entities/point.entity';
import { EventService } from './event.service';
import { Review } from '../review/entities/review.entity';
import { Place } from '../place/entities/place.entity';
import { EventController } from './event.controller';
import { User } from '../user/entities/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Point, Review, Place, User])],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
