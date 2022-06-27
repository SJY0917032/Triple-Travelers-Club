import { Module } from '@nestjs/common';
import { Point } from './entities/point.entity';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointController } from './point.controller';
import { PointService } from './point.service';

@Module({
  imports: [TypeOrmModule.forFeature([Point, User])],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
