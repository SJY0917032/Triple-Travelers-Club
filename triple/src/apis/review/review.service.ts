import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaceService } from '../place/place.service';
import { ReviewImageService } from '../reviewImage/reviewImage.service';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly placeService: PlaceService,
    private readonly reviewImageService: ReviewImageService,
  ) {}
}
