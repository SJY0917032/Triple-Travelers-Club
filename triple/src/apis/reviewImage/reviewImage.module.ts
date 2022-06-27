import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../review/entities/review.entity';
import { ReviewImage } from './entities/reviewImage.entity';
import { ReviewImageService } from './reviewImage.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewImage, Review])],
  providers: [ReviewImageService],
  exports: [ReviewImageService],
})
export class ReviewImageModule {}
