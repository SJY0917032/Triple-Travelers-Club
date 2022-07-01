import { Test } from '@nestjs/testing';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { Review } from '../entities/review.entity';
import { ReviewService } from '../review.service';
import { ReviewImageService } from '../../reviewImage/reviewImage.service';
import { CreateReviewDto } from '../dto/createReviewDto';
import { EventDto } from '../../event/dto/eventDto';
import {
  ActionFormat,
  EventTypeFormat,
} from '../../point/entities/point.entity';
import { UpdateReviewDto } from '../dto/updateReviewDto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  softRemove: jest.fn(),
});

const mockReviewImageService = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let reviewRepository: MockRepository<Review>;
  let dataSource: DataSource;

  const qr = {
    manager: {},
  } as QueryRunner;

  class dataSourceMock {
    createQueryRunner(): QueryRunner {
      return qr;
    }
  }

  qr.connect = jest.fn();
  qr.startTransaction = jest.fn();
  qr.commitTransaction = jest.fn();
  qr.rollbackTransaction = jest.fn();
  qr.release = jest.fn();

  beforeEach(async () => {
    Object.assign(qr.manager, { save: jest.fn(), findOne: jest.fn() });

    const module = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: 'ReviewRepository', useFactory: mockRepository },
        { provide: ReviewImageService, useFactory: mockReviewImageService },
        { provide: DataSource, useClass: dataSourceMock },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
    reviewRepository = module.get('ReviewRepository') as MockRepository<Review>;
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(reviewService).toBeDefined();
  });

  describe('create', () => {
    it('새로운 리뷰를 생성합니다.', async () => {
      const eventDto: EventDto = {
        type: EventTypeFormat.REVIEW,
        action: ActionFormat.ADD,
        reviewId: '1',
        content: '1',
        attachedPhotoIds: [],
        userId: '1',
        placeId: '1',
      };

      const queryRunner = dataSource.createQueryRunner();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce({ id: '1' });
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce({ id: '1' });
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValueOnce({
        id: '1',
        content: '1',
        user: { id: '1' },
        place: { id: '1' },
      });

      const qrSpyOnFindOne = jest.spyOn(queryRunner.manager, 'findOne');
      const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
      const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
      const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
      const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

      reviewRepository.create.mockResolvedValue({
        id: '1',
        content: '1',
        user: { id: '1' },
        place: { id: '1' },
      });

      const result = await reviewService.create({
        title: '1',
        content: '1',
        userId: '1',
        placeId: '1',
      } as CreateReviewDto);

      expect(result).toEqual(eventDto);
      expect(qrSpyOnFindOne).toHaveBeenCalledTimes(3);
      expect(qrSpyOnSave).toHaveBeenCalledTimes(1);
      expect(qrSpyOnCommit).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRollback).toHaveBeenCalledTimes(0);
      expect(qrSpyOnRelease).toHaveBeenCalledTimes(1);
    });

    it('생성중 오류가 발생하는 경우 - 유저가 없는경우', async () => {
      const queryRunner = dataSource.createQueryRunner();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);

      const qrSpyOnFindOne = jest.spyOn(queryRunner.manager, 'findOne');
      const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
      const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
      const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
      const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

      await expect(
        reviewService.create({
          title: '1',
          content: '1',
          userId: '1',
          placeId: '1',
        } as CreateReviewDto),
      ).rejects.toThrowError('해당 유저가 존재하지 않습니다.');

      expect(qrSpyOnFindOne).toHaveBeenCalledTimes(1);
      expect(qrSpyOnSave).toHaveBeenCalledTimes(0);
      expect(qrSpyOnCommit).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRollback).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRelease).toHaveBeenCalledTimes(2);
    });

    it('생성중 오류가 발생하는 경우 - 장소가 없는경우', async () => {
      const queryRunner = dataSource.createQueryRunner();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce('유저');
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);

      const qrSpyOnFindOne = jest.spyOn(queryRunner.manager, 'findOne');
      const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
      const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
      const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
      const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

      await expect(
        reviewService.create({
          title: '1',
          content: '1',
          userId: '1',
          placeId: '1',
        } as CreateReviewDto),
      ).rejects.toThrowError('해당 장소가 존재하지 않습니다.');

      expect(qrSpyOnFindOne).toHaveBeenCalledTimes(2);
      expect(qrSpyOnSave).toHaveBeenCalledTimes(0);
      expect(qrSpyOnCommit).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRollback).toHaveBeenCalledTimes(2);
      expect(qrSpyOnRelease).toHaveBeenCalledTimes(3);
    });
    it('생성중 오류가 발생하는 경우 - 이미 리뷰를 작성한 경우', async () => {
      const queryRunner = dataSource.createQueryRunner();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce('유저');
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce('장소');
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce('유저가작성한 해당 장소의 리뷰');

      const qrSpyOnFindOne = jest.spyOn(queryRunner.manager, 'findOne');
      const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
      const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
      const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
      const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

      await expect(
        reviewService.create({
          title: '1',
          content: '1',
          userId: '1',
          placeId: '1',
        } as CreateReviewDto),
      ).rejects.toThrowError('이미 작성한 리뷰가 존재합니다.');

      expect(qrSpyOnFindOne).toHaveBeenCalledTimes(3);
      expect(qrSpyOnSave).toHaveBeenCalledTimes(0);
      expect(qrSpyOnCommit).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRollback).toHaveBeenCalledTimes(3);
      expect(qrSpyOnRelease).toHaveBeenCalledTimes(4);
    });
  });

  // Test to ReviewService.update
  describe('update', () => {
    it('리뷰 수정 완료', async () => {
      const eventDto: EventDto = {
        type: EventTypeFormat.REVIEW,
        action: ActionFormat.MOD,
        reviewId: '1',
        content: '2',
        attachedPhotoIds: [],
        userId: '1',
        placeId: '1',
      };

      reviewRepository.findOne.mockResolvedValueOnce({
        id: '1',
        content: '1',
        images: [],
        user: { id: '1' },
        place: { id: '1' },
      });
      reviewRepository.save.mockResolvedValue({
        id: '1',
        content: '2',
        images: [],
        user: { id: '1' },
        place: { id: '1' },
      });
      reviewRepository.findOne.mockResolvedValueOnce({
        id: '1',
        content: '2',
        images: [],
        user: { id: '1' },
        place: { id: '1' },
      });

      const reviewRepositorySpyFindOne = jest.spyOn(
        reviewRepository,
        'findOne',
      );
      const reviewRepositorySpySave = jest.spyOn(reviewRepository, 'save');

      const result = await reviewService.update('1', {
        content: '2',
      } as UpdateReviewDto);

      expect(result).toEqual(eventDto);
      expect(reviewRepositorySpyFindOne).toHaveBeenCalledTimes(2);
      expect(reviewRepositorySpySave).toHaveBeenCalledTimes(1);
    });

    it('존재하지 않는 리뷰입니다.', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      expect(
        reviewService.update('1', {
          content: '2',
        } as UpdateReviewDto),
      ).rejects.toThrowError('존재하지 않는 리뷰입니다.');
    });
  });

  // Test to ReviewService.delete
  describe('delete', () => {
    it('리뷰 삭제 완료', async () => {
      const eventDto: EventDto = {
        type: EventTypeFormat.REVIEW,
        action: ActionFormat.DELETE,
        reviewId: '1',
        content: '1',
        attachedPhotoIds: [],
        userId: '1',
        placeId: '1',
      };

      reviewRepository.findOne.mockResolvedValueOnce({
        id: '1',
        content: '1',
        images: [],
        user: { id: '1' },
        place: { id: '1' },
      });
      reviewRepository.softRemove.mockResolvedValue(undefined);

      const reviewRepositorySpyFindOne = jest.spyOn(
        reviewRepository,
        'findOne',
      );
      const reviewRepositorySpySoftRemove = jest.spyOn(
        reviewRepository,
        'softRemove',
      );

      const result = await reviewService.delete('1');

      expect(result).toEqual(eventDto);
      expect(reviewRepositorySpyFindOne).toHaveBeenCalledTimes(1);
      expect(reviewRepositorySpySoftRemove).toHaveBeenCalledTimes(1);
    });

    it('이미 삭제됐거나 존재하지 않는 리뷰입니다.', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      expect(reviewService.delete('1')).rejects.toThrowError(
        '이미 삭제됐거나 존재하지 않는 리뷰입니다.',
      );
    });
  });

  describe('findAll', () => {
    it('리뷰 전체 조회 완료', async () => {
      reviewRepository.find.mockResolvedValue([
        {
          id: '1',
          content: '1',
          images: [],
          user: { id: '1' },
          place: { id: '1' },
        },
      ]);

      const result = await reviewService.findAll();

      expect(result).toEqual([
        {
          id: '1',
          content: '1',
          images: [],
          user: { id: '1' },
          place: { id: '1' },
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('리뷰 조회 완료', async () => {
      reviewRepository.findOne.mockResolvedValueOnce({
        id: '1',
        content: '1',
        images: [],
        user: { id: '1' },
        place: { id: '1' },
      });

      const result = await reviewService.findOneById('1');

      expect(result).toEqual({
        id: '1',
        content: '1',
        images: [],
        user: { id: '1' },
        place: { id: '1' },
      });
    });

    it('존재하지 않는 리뷰입니다.', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      expect(reviewService.findOneById('1')).rejects.toThrowError(
        '존재하지 않는 리뷰입니다.',
      );
    });
  });

  describe('findByUserId', () => {
    it('리뷰 조회 완료', async () => {
      reviewRepository.find.mockResolvedValue([
        {
          id: '1',
          content: '1',
          images: [],
          user: { id: '1' },
          place: { id: '1' },
        },
      ]);

      const result = await reviewService.findAllByUserId('1');

      expect(result).toEqual([
        {
          id: '1',
          content: '1',
          images: [],
          user: { id: '1' },
          place: { id: '1' },
        },
      ]);
    });
  });
});
