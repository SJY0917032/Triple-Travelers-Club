import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewImage } from '../reviewImage/entities/reviewImage.entity';
import { PlaceModule } from '../place/place.module';
import { ReviewImageModule } from '../reviewImage/reviewImage.module';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewImage]),
    PlaceModule,
    ReviewImageModule,
  ],
  providers: [ReviewController, ReviewService],
})
export class ReviewModule {}
