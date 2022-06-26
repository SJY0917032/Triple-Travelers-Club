import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewImage } from './entities/reviewImage.entity';

export class ReviewImageService {
  constructor(
    @InjectRepository(ReviewImage)
    private readonly reviewImageRepository: Repository<ReviewImage>,
  ) {}
}
