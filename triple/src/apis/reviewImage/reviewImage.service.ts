import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../review/entities/review.entity';
import { CreateReviewImageDto } from './dto/createReviewImageDto';
import { ReviewImage } from './entities/reviewImage.entity';

export class ReviewImageService {
  constructor(
    @InjectRepository(ReviewImage)
    private readonly reviewImageRepository: Repository<ReviewImage>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  // create with dto
  async create(createReviewImageDto: CreateReviewImageDto) {
    const { url, review } = createReviewImageDto;

    const findImage = await this.reviewImageRepository.findOne({
      where: {
        url,
      },
    });
    if (!findImage) {
      const image = this.reviewImageRepository.create({
        url: url,
        review: review,
      });
      return image;
    }

    return findImage;
  }

  async delete(id: string) {
    const reviewImage = await this.reviewImageRepository.findOne({
      where: { id: id },
    });

    return await this.reviewImageRepository.softRemove(reviewImage);
  }

  async save(reviewImage: ReviewImage) {
    return await this.reviewImageRepository.save(reviewImage);
  }
}
