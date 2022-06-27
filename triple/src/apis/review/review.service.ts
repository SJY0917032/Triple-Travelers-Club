import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Place } from '../place/entities/place.entity';
import { ReviewImageService } from '../reviewImage/reviewImage.service';
import { User } from '../user/entities/user.entity';
import { CreateReviewDto } from './dto/createReviewDto';
import { Review } from './entities/review.entity';
import { UpdateReviewDto } from './dto/updateReviewDto';
import { ActionFormat, EventTypeFormat } from '../point/entities/point.entity';
import { ReviewImage } from '../reviewImage/entities/reviewImage.entity';
import { EventDto } from '../event/dto/eventDto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly reviewImageService: ReviewImageService,

    private readonly dataSource: DataSource,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const { content, userId, placeId, reviewImageUrls } = createReviewDto;

    if (!content || !userId || !placeId) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new BadRequestException('해당 유저가 존재하지 않습니다.');
      }

      const place = await queryRunner.manager.findOne(Place, {
        where: {
          id: placeId,
        },
      });

      if (!place) {
        throw new BadRequestException('해당 장소가 존재하지 않습니다.');
      }

      const review = this.reviewRepository.create({
        content,
        user: user,
        place: place,
      });

      await queryRunner.manager.save(review);

      const attachedPhotoIds = [];
      if (reviewImageUrls) {
        for (let i = 0; i < reviewImageUrls.length; i++) {
          const reviewImage = await this.reviewImageService.create({
            url: reviewImageUrls[i],
            review: review,
          });
          await queryRunner.manager.save(reviewImage);
          attachedPhotoIds.push(reviewImage.id);
        }
      }

      await queryRunner.commitTransaction();

      const result: EventDto = {
        type: EventTypeFormat.REVIEW,
        action: ActionFormat.ADD,
        reviewId: review.id,
        content: review.content,
        attachedPhotoIds: attachedPhotoIds,
        userId: user.id,
        placeId: place.id,
      };

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOneById(id: string) {
    const result = await this.reviewRepository.findOne({
      where: {
        id: id,
      },
      relations: ['user', 'place', 'images'],
    });

    if (!result) {
      throw new BadRequestException('존재하지않는 리뷰입니다.');
    }

    return result;
  }

  async findAllByUserId(userId: string) {
    return await this.reviewRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user', 'place', 'images'],
    });
  }

  async update(reviewId: string, updateReviewDto: UpdateReviewDto) {
    const { content, reviewImageUrls } = updateReviewDto;
    const review = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
      relations: ['images'],
    });
    if (!review) {
      throw new BadRequestException('존재하지않는 리뷰입니다.');
    }
    if (content) {
      review.content = content;
    }
    const images: ReviewImage[] = [];
    if (reviewImageUrls) {
      for (let i = 0; i < reviewImageUrls.length; i++) {
        let reviewImage = await this.reviewImageService.create({
          url: reviewImageUrls[i],
          review: review,
        });

        if (!review.images.includes(reviewImage)) {
          reviewImage = await this.reviewImageService.save(reviewImage);
        }
        images.push(reviewImage);
      }
    }
    await this.reviewRepository.save({
      ...review,
      images: images,
    });
    const updateReviewResult = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
      relations: ['user', 'place', 'images'],
    });

    const result: EventDto = {
      type: EventTypeFormat.REVIEW,
      action: ActionFormat.MOD,
      reviewId: updateReviewResult.id,
      content: updateReviewResult.content,
      attachedPhotoIds: updateReviewResult.images.map((image) => image.id),
      userId: updateReviewResult.user.id,
      placeId: updateReviewResult.place.id,
    };
    return result;
  }

  async delete(reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
      relations: ['user', 'place', 'images'],
    });
    if (!review) {
      throw new BadRequestException(
        '이미 삭제됐거나 존재하지 않는 리뷰입니다.',
      );
    }
    await this.reviewRepository.softRemove(review);
    const result: EventDto = {
      type: EventTypeFormat.REVIEW,
      action: ActionFormat.DELETE,
      reviewId: review.id,
      content: review.content,
      attachedPhotoIds: review.images.map((image) => image.id),
      userId: review.user.id,
      placeId: review.place.id,
    };
    return result;
  }
}
