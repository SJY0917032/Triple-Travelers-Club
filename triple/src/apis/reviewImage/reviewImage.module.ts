import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewImage } from './entities/reviewImage.entity';
import { ReviewImageService } from './reviewImage.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewImage])],
  providers: [ReviewImageService],
  exports: [ReviewImageService],
})
export class ReviewImageModule {}
