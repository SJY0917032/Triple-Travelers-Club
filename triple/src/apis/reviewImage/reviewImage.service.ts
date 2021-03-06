import { UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewImageDto } from './dto/createReviewImageDto';
import { ReviewImage } from './entities/reviewImage.entity';

export class ReviewImageService {
  constructor(
    @InjectRepository(ReviewImage)
    private readonly reviewImageRepository: Repository<ReviewImage>,
  ) {}

  /**
   * @author SJY0917032
   * @description 이미지를 연결한 리뷰를 생성합니다.
   *
   * @returns {Promise<ReviewImage>} 생성된 리뷰의 이미지
   */
  async create(
    createReviewImageDto: CreateReviewImageDto,
  ): Promise<ReviewImage> {
    const { url, review } = createReviewImageDto;

    if (!url || !review) {
      throw new UnprocessableEntityException('이미지 정보를 입력해주세요.');
    }

    const findImage = await this.reviewImageRepository.findOne({
      where: {
        url: url,
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

  /**
   * @author SJY0917032
   * @description Transaction으로 생성된 ReviewImage를 Save시킵니다.
   *
   * @param reviewImage Create된 ReviewImage
   * @returns {Promise<ReviewImage>} 생성된 ReviewImage
   */
  async save(reviewImage: ReviewImage): Promise<ReviewImage> {
    return await this.reviewImageRepository.save(reviewImage);
  }
}
