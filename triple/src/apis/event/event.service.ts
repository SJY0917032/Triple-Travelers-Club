import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Review } from '../review/entities/review.entity';
import { User } from '../user/entities/user.entity';
import { Place } from '../place/entities/place.entity';
import {
  ActionFormat,
  Point,
  ReasonFormat,
} from '../point/entities/point.entity';
import { EventDto } from './dto/eventDto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>, //
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>, //
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>, //

    private readonly dataSource: DataSource,
  ) {}

  async eventDistributor(eventDto: EventDto) {
    if (eventDto.action === ActionFormat.ADD) {
      const result: Point[] = await this.addEvent(eventDto);
      return result;
    }

    if (eventDto.action === ActionFormat.MOD) {
      const result: Point | void = await this.modEvent(eventDto);
      return result;
    }

    if (eventDto.action === ActionFormat.DELETE) {
      const result: Point[] = await this.deleteEvent(eventDto);
      return result;
    }
  }

  private async addEvent({
    type,
    action,
    userId,
    placeId,
    reviewId,
    attachedPhotoIds,
  }: EventDto): Promise<Point[]> {
    const result: Point[] = [];

    const ADD_SCORE = attachedPhotoIds.length >= 1 ? 2 : 1;

    const reason =
      ADD_SCORE === 2
        ? ReasonFormat.REVIEW_ADD_with_PHOTO
        : ReasonFormat.REVIEW_ADD;

    const user = await this.checkUser(userId);
    const review = await this.checkReview(reviewId);
    const isFirstWrite = await this.IsFirstWrite(placeId, reviewId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const addPoint = this.pointRepository.create({
        type: type,
        action: action,
        user: user,
        review: review,
        score: ADD_SCORE,
        reason: reason,
      });

      await this.pointRepository.save(addPoint);
      result.push(addPoint);

      if (isFirstWrite) {
        const bonusPoint = this.pointRepository.create({
          type: type,
          action: action,
          user: user,
          review: review,
          score: 1,
          reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE,
        });
        await this.pointRepository.save(bonusPoint);
        result.push(bonusPoint);
      }

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async modEvent({
    type,
    action,
    userId,
    placeId,
    reviewId,
    attachedPhotoIds,
  }: EventDto): Promise<Point | void> {
    const user = await this.checkUser(userId);
    const review = await this.checkReview(reviewId);
    const score = await this.modScoreCheck(review, attachedPhotoIds);

    if (score != 0) {
      const reason =
        score > 0
          ? ReasonFormat.REVIEW_MOD_ADD_PHOTO
          : ReasonFormat.REVIEW_MOD_DELETE_PHOTO;

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction('SERIALIZABLE');

      try {
        const modPoint = this.pointRepository.create({
          type: type,
          action: action,
          user: user,
          review: review,
          score: score,
          reason: reason,
        });

        await this.pointRepository.save(modPoint);

        await queryRunner.commitTransaction();
        return modPoint;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }

  private async deleteEvent({
    type,
    action,
    userId,
    placeId,
    reviewId,
    attachedPhotoIds,
  }: EventDto): Promise<Point[]> {
    const result: Point[] = [];
    const user = await this.checkUser(userId);
    const review = await this.checkReview(reviewId);
    const score = await this.deleteScoreCheck(review); // [ 삭제한 리뷰의 차감점수, 차감할 첫글 보너스점수 ]

    const reason =
      score[0] === -2
        ? ReasonFormat.REVIEW_DELETE_with_PHOTO
        : ReasonFormat.REVIEW_DELETE;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const deletePoint = this.pointRepository.create({
        type: type,
        action: action,
        user: user,
        review: review,
        score: score[0],
        reason: reason,
      });

      await this.pointRepository.save(deletePoint);
      result.push(deletePoint);

      if (score[1] !== 0) {
        const deleteBonusPoint = this.pointRepository.create({
          type: type,
          action: action,
          user: user,
          review: review,
          score: score[1],
          reason: ReasonFormat.REVIEW_DELETE_FIRST_PLACE,
        });
        await this.pointRepository.save(deleteBonusPoint);
        result.push(deleteBonusPoint);
      }
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async checkUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new BadRequestException('해당 유저가 존재하지 않습니다.');
    }

    return user;
  }

  private async checkReview(reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
      relations: ['point'],
      withDeleted: true,
    });

    if (!review) {
      throw new BadRequestException('해당 리뷰가 존재하지 않습니다.');
    }

    return review;
  }

  private async IsFirstWrite(placeId: string, reviewId: string) {
    const firstReview = await this.reviewRepository.findOne({
      where: {
        place: {
          id: placeId,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return firstReview.id === reviewId ? true : false;
  }

  private async modScoreCheck(review: Review, attachedPhotoIds: string[]) {
    const point = await this.pointRepository.find({
      where: {
        review: {
          id: review.id,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (point[0].reason === ReasonFormat.REVIEW_ADD_FIRST_PLACE) {
      point[0] = point[1];
    }

    console.log(point[0]);

    if (
      point[0].reason === ReasonFormat.REVIEW_MOD_ADD_PHOTO ||
      point[0].reason === ReasonFormat.REVIEW_ADD_with_PHOTO
    ) {
      if (attachedPhotoIds.length === 0) {
        return -1;
      }
    }

    if (
      point[0].reason === ReasonFormat.REVIEW_MOD_DELETE_PHOTO ||
      point[0].reason === ReasonFormat.REVIEW_ADD
    ) {
      if (attachedPhotoIds.length > 0) {
        return 1;
      }
    }

    return 0;
  }

  private async deleteScoreCheck(review: Review): Promise<number[]> {
    const point = await this.pointRepository.find({
      withDeleted: true,
      where: {
        review: {
          id: review.id,
        },
      },
      order: { createdAt: 'DESC' },
    });

    let isFirstWrite: number;
    let reviewPoint: number;
    if (point[0].reason === ReasonFormat.REVIEW_ADD_FIRST_PLACE) {
      isFirstWrite = -1;
      reviewPoint = point[1].score * -1;
      return [reviewPoint, isFirstWrite];
    }

    if (
      review.point.some((e) => {
        return e.reason === ReasonFormat.REVIEW_ADD_FIRST_PLACE;
      })
    ) {
      isFirstWrite = -1;
    } else {
      isFirstWrite = 0;
    }

    if (point[0].reason === ReasonFormat.REVIEW_MOD_ADD_PHOTO) {
      reviewPoint = -2;
      return [reviewPoint, isFirstWrite];
    }

    if (point[0].reason === ReasonFormat.REVIEW_MOD_DELETE_PHOTO) {
      reviewPoint = -1;
      return [reviewPoint, isFirstWrite];
    }
  }
}
