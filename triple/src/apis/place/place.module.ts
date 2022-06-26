import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { PlaceService } from './place.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place])],
  providers: [PlaceService],
  exports: [PlaceService],
})
export class PlaceModule {}
