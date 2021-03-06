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
    it('????????? ????????? ???????????????.', async () => {
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

    it('????????? ????????? ???????????? ?????? - ????????? ????????????', async () => {
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
      ).rejects.toThrowError('?????? ????????? ???????????? ????????????.');

      expect(qrSpyOnFindOne).toHaveBeenCalledTimes(1);
      expect(qrSpyOnSave).toHaveBeenCalledTimes(0);
      expect(qrSpyOnCommit).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRollback).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRelease).toHaveBeenCalledTimes(2);
    });

    it('????????? ????????? ???????????? ?????? - ????????? ????????????', async () => {
      const queryRunner = dataSource.createQueryRunner();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce('??????');
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
      ).rejects.toThrowError('?????? ????????? ???????????? ????????????.');

      expect(qrSpyOnFindOne).toHaveBeenCalledTimes(2);
      expect(qrSpyOnSave).toHaveBeenCalledTimes(0);
      expect(qrSpyOnCommit).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRollback).toHaveBeenCalledTimes(2);
      expect(qrSpyOnRelease).toHaveBeenCalledTimes(3);
    });
    it('????????? ????????? ???????????? ?????? - ?????? ????????? ????????? ??????', async () => {
      const queryRunner = dataSource.createQueryRunner();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce('??????');
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValueOnce('??????');
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce('?????????????????? ?????? ????????? ??????');

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
      ).rejects.toThrowError('?????? ????????? ????????? ???????????????.');

      expect(qrSpyOnFindOne).toHaveBeenCalledTimes(3);
      expect(qrSpyOnSave).toHaveBeenCalledTimes(0);
      expect(qrSpyOnCommit).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRollback).toHaveBeenCalledTimes(3);
      expect(qrSpyOnRelease).toHaveBeenCalledTimes(4);
    });
  });

  // Test to ReviewService.update
  describe('update', () => {
    it('?????? ?????? ??????', async () => {
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

    it('???????????? ?????? ???????????????.', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      expect(
        reviewService.update('1', {
          content: '2',
        } as UpdateReviewDto),
      ).rejects.toThrowError('???????????? ?????? ???????????????.');
    });
  });

  // Test to ReviewService.delete
  describe('delete', () => {
    it('?????? ?????? ??????', async () => {
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

    it('?????? ??????????????? ???????????? ?????? ???????????????.', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      expect(reviewService.delete('1')).rejects.toThrowError(
        '?????? ??????????????? ???????????? ?????? ???????????????.',
      );
    });
  });

  describe('findAll', () => {
    it('?????? ?????? ?????? ??????', async () => {
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
    it('?????? ?????? ??????', async () => {
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

    it('???????????? ?????? ???????????????.', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      expect(reviewService.findOneById('1')).rejects.toThrowError(
        '???????????? ?????? ???????????????.',
      );
    });
  });

  describe('findByUserId', () => {
    it('?????? ?????? ??????', async () => {
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
