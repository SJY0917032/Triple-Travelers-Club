import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
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
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>, //

    private readonly dataSource: DataSource,
  ) {}

  /**
   * @author SJY0917032
   * @description 들어온 DTO의 값으로 이벤트를 분기합니다
   *
   * ADD -> addEvent
   *
   * MOD -> modEvent
   *
   * DELETE -> deleteEvent
   *
   */
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

  /**
   * @author SJY0917032
   * @description 리뷰 생성 점수를 계산합니다.
   *
   * 글을 작성시 1점
   *
   * 위의 글이 사진이 존재하면 2점
   *
   * 리뷰 작성 장소의 첫 리뷰면 추가로 1점을 더합니다
   *
   * @returns {[Point]} [Point]
   */
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
      const addPoint = await this.pointRepository.create({
        type: type,
        action: action,
        user: user,
        review: review,
        score: ADD_SCORE,
        reason: reason,
      });

      await queryRunner.manager.save(addPoint);
      result.push(addPoint);

      if (isFirstWrite) {
        const bonusPoint = await this.pointRepository.create({
          type: type,
          action: action,
          user: user,
          review: review,
          score: 1,
          reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE,
        });
        await queryRunner.manager.save(bonusPoint);
        result.push(bonusPoint);
      }

      const checkUserLevel = await this.userLevelCheck(user);
      await this.updateUserLevel(user, checkUserLevel, queryRunner);
      await queryRunner.commitTransaction();
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
   * @description 리뷰 수정 점수를 계산합니다.

   * 수정 된 글의 사진이 존재했지만 더이상 존재하지 않으면 -1점
   *
   * 수정 된 글의 사진이 없었지만 추가됐다면 1점
   *
   * @returns [Point] OR void
   */
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

        await queryRunner.manager.save(modPoint);

        const checkUserLevel = await this.userLevelCheck(user);
        await this.updateUserLevel(user, checkUserLevel, queryRunner);

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

  /**
   * @author SJY0917032
   * @description 리뷰 삭제 점수를 계산합니다.
   *
   * 사진이 들어있는 리뷰를 삭제시 -2점
   * 글만 들어있는 리뷰를 삭제시 -1점
   * 리뷰 작성 장소의 첫 리뷰면 추가로 -1점을 차감합니다.
   *
   * @returns [Point] OR void
   */
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
      const deletePoint = await this.pointRepository.create({
        type: type,
        action: action,
        user: user,
        review: review,
        score: score[0],
        reason: reason,
      });

      await queryRunner.manager.save(deletePoint);
      result.push(deletePoint);

      if (score[1] !== 0) {
        const deleteBonusPoint = await this.pointRepository.create({
          type: type,
          action: action,
          user: user,
          review: review,
          score: score[1],
          reason: ReasonFormat.REVIEW_DELETE_FIRST_PLACE,
        });
        await queryRunner.manager.save(deleteBonusPoint);
        result.push(deleteBonusPoint);
      }
      const checkUserLevel = await this.userLevelCheck(user);
      await this.updateUserLevel(user, checkUserLevel, queryRunner);

      await queryRunner.commitTransaction();
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
   * @description 들어온 유저 ID로 유저를 조회합니다.
   *
   * @param userId 유저 아이디 (UUID)
   * @returns {User} User
   */
  private async checkUser(userId: string): Promise<User> {
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

  /**
   * @author SJY0917032
   * @description 들어온 리뷰 ID로 리뷰를 조회합니다.
   *
   * @param reviewId 리뷰 아이디 (UUID)
   * @returns {Review} Review
   */
  private async checkReview(reviewId: string): Promise<Review> {
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

  /**
   * @author SJY0917032
   * @description 해당 리뷰가 장소의 첫 리뷰인지 확인합니다.
   *
   * @param placeId 장소의 ID (UUID)
   * @param reviewId 리뷰의 ID (UUID)
   * @returns {boolean} true: 첫 리뷰, false: 첫 리뷰 아님
   */
  private async IsFirstWrite(
    placeId: string,
    reviewId: string,
  ): Promise<boolean> {
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

  /**
   * @author SJY0917032
   * @description 리뷰 수정 점수를 계산합니다.
   *
   * @param review 리뷰
   * @param attachedPhotoIds 첨부된 사진의 ID들
   * @returns {number} 1 | -1 | 0
   */
  private async modScoreCheck(
    review: Review,
    attachedPhotoIds: string[],
  ): Promise<number> {
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

  /**
   * @author SJY0917032
   * @description 리뷰 삭제 점수를 계산합니다.
   *
   * @param review 리뷰
   * @returns {number[]} [0]: 차감할 작성한 글의 점수, [1]: 차감할 첫 글 보너스 점수
   */
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

    if (
      point[0].reason === ReasonFormat.REVIEW_MOD_ADD_PHOTO ||
      point[0].reason === ReasonFormat.REVIEW_ADD_with_PHOTO
    ) {
      reviewPoint = -2;
      return [reviewPoint, isFirstWrite];
    }

    if (
      point[0].reason === ReasonFormat.REVIEW_MOD_DELETE_PHOTO ||
      point[0].reason === ReasonFormat.REVIEW_ADD
    ) {
      reviewPoint = -1;
      return [reviewPoint, isFirstWrite];
    }
  }

  /**
   * @author SJY0917032
   * @description 유저의 점수를 계산해 변경할 레벨을 확인합니다.
   *
   * @param user 유저
   * @returns {number} level
   */
  private async userLevelCheck(user: User): Promise<number> {
    const userPoint = await this.pointRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    const currentUserPoint = userPoint.reduce((acc, cur) => {
      return acc + Number(cur.score);
    }, 0);

    if (currentUserPoint < 45) {
      return 1;
    }
    if (currentUserPoint < 100) {
      return 2;
    }
    if (currentUserPoint >= 100) {
      return 3;
    }
  }

  /**
   * @author SJY0917032
   * @description 유저의 현재 레벨과 변경할 레벨이 다르면 유저를 업데이트 시킵니다.
   *
   * @param user 유저
   * @param level 레벨
   * @param qr 쿼리러너
   *
   * @returns {Promise<void>}
   */
  private async updateUserLevel(
    user: User,
    level: number,
    qr: QueryRunner,
  ): Promise<void> {
    if (user.level != level) {
      const update = this.userRepository.create({
        ...user,
        level: level,
      });

      await qr.manager.save(update);
    }
  }
}
