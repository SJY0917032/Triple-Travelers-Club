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

  /**
   * @author SJY0917032
   * @description 들어온 DTO의 값으로 리뷰를 생성합니다.
   *
   * @returns {Promise<EventDto>} 생성된 리뷰로 EventDto를 반환합니다.
   */
  async create(createReviewDto: CreateReviewDto): Promise<EventDto> {
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

      const checkExistReview = await queryRunner.manager.findOne(Review, {
        where: {
          user: {
            id: userId,
          },
          place: {
            id: placeId,
          },
        },
      });

      if (checkExistReview) {
        throw new BadRequestException('이미 작성한 리뷰가 존재합니다.');
      }

      const review = await this.reviewRepository.create({
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

  /**
   * @author SJY0917032
   * @description 리뷰의 목록을 전체 조회합니다.
   *
   * @returns {Promise<Review[]>} 리뷰 목록을 반환합니다.
   */
  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find({
      relations: ['user', 'place', 'images'],
    });
  }

  /**
   * @author SJY0917032
   * @description 들어온 REVIEW UUID로 리뷰를 조회합니다..
   *
   * @param reviewId 리뷰의 UUID
   * @returns {Promise<Review>} 리뷰를 반환합니다.
   */
  async findOneById(reviewId: string): Promise<Review> {
    const result = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
      relations: ['user', 'place', 'images'],
    });

    if (!result) {
      throw new BadRequestException('존재하지 않는 리뷰입니다.');
    }

    return result;
  }

  /**
   * @author SJY0917032
   * @description 유저 UUID로 리뷰를 조회해 작성한 리뷰들을 반환합니다.
   *
   * @param userId 유저의 UUID
   * @returns {Promise<Review[]>} 유저가 작성한 리뷰를 반환합니다.
   */
  async findAllByUserId(userId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user', 'place', 'images'],
    });
  }

  /**
   * @author SJY0917032
   * @description 리뷰 UUID로 리뷰를 조회해 해당 리뷰를 DTO의 내용으로 수정합니다.
   *
   * @param reviewId 리뷰의 UUID
   * @returns {Promise<EventDto>} 수정된 리뷰로 EventDto를 반환합니다.
   */
  async update(
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<EventDto> {
    const { content, reviewImageUrls } = updateReviewDto;
    const review = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
      relations: ['images'],
    });
    if (!review) {
      throw new BadRequestException('존재하지 않는 리뷰입니다.');
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

  /**
   * @author SJY0917032
   * @description 리뷰 UUID로 리뷰를 조회해 해당 리뷰를 삭제합니다.
   *
   * @param reviewId 삭제할 리뷰의 UUID
   * @returns {Promise<EventDto>} 삭제된 리뷰로 EventDto를 반환합니다.
   */
  async delete(reviewId: string): Promise<EventDto> {
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
