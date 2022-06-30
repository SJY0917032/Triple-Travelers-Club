import { Test } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import {
  ActionFormat,
  EventTypeFormat,
  Point,
  ReasonFormat,
} from '../../point/entities/point.entity';
import { Review } from '../../review/entities/review.entity';
import { User } from '../../user/entities/user.entity';
import { EventDto } from '../dto/eventDto';
import { EventService } from '../event.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  softRemove: jest.fn(),
});

describe('EventService', () => {
  let eventService: EventService;
  let reviewRepository: MockRepository<Review>;
  let userRepository: MockRepository<User>;
  let pointRepository: MockRepository<Point>;
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
        EventService,
        { provide: 'ReviewRepository', useFactory: mockRepository },
        { provide: 'UserRepository', useFactory: mockRepository },
        { provide: 'PointRepository', useFactory: mockRepository },
        { provide: DataSource, useClass: dataSourceMock },
      ],
    }).compile();

    eventService = module.get<EventService>(EventService);
    reviewRepository = module.get('ReviewRepository') as MockRepository<Review>;
    userRepository = module.get('UserRepository') as MockRepository<User>;
    pointRepository = module.get('PointRepository') as MockRepository<Point>;
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(eventService).toBeDefined();
  });

  describe('eventDistribution', () => {
    describe('ADD', () => {
      it('ADD - No Photo - firstWrite', async () => {
        const eventDto: EventDto = {
          type: EventTypeFormat.REVIEW,
          action: ActionFormat.ADD,
          reviewId: '1',
          content: '1',
          attachedPhotoIds: [],
          userId: '1',
          placeId: '1',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          nickName: '1',
          email: '1',
          password: '1',
          level: 1,
        });
        jest.spyOn(reviewRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          content: '1',
          point: [],
        });
        jest
          .spyOn(reviewRepository, 'findOne')
          .mockResolvedValueOnce({ id: '1' });
        jest.spyOn(pointRepository, 'find').mockResolvedValueOnce([]);
        jest
          .spyOn(pointRepository, 'create')
          .mockResolvedValueOnce({ reason: ReasonFormat.REVIEW_ADD, score: 1 });
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE,
          score: 1,
        });

        const testResult = [
          { reason: ReasonFormat.REVIEW_ADD, score: 1 },
          {
            reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE,
            score: 1,
          },
        ];
        const queryRunner = dataSource.createQueryRunner();
        const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
        const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
        const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
        const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

        const result = await eventService.eventDistributor(eventDto);

        expect(result).toEqual(testResult);
        expect(qrSpyOnSave).toBeCalledTimes(2);
        expect(qrSpyOnCommit).toBeCalledTimes(1);
        expect(qrSpyOnRollback).toBeCalledTimes(0);
        expect(qrSpyOnRelease).toBeCalledTimes(1);
      });
      it('ADD - With Photo - firstWrite', async () => {
        const eventDto: EventDto = {
          type: EventTypeFormat.REVIEW,
          action: ActionFormat.ADD,
          reviewId: '1',
          content: '1',
          attachedPhotoIds: ['a'],
          userId: '1',
          placeId: '1',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          nickName: '1',
          email: '1',
          password: '1',
          level: 1,
        });
        jest.spyOn(reviewRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          content: '1',
          point: [],
        });
        jest
          .spyOn(reviewRepository, 'findOne')
          .mockResolvedValueOnce({ id: '1' });
        jest.spyOn(pointRepository, 'find').mockResolvedValueOnce([]);
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          reason: ReasonFormat.REVIEW_ADD_with_PHOTO,
          score: 2,
        });
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE,
          score: 1,
        });

        const testResult = [
          { reason: ReasonFormat.REVIEW_ADD_with_PHOTO, score: 2 },
          {
            reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE,
            score: 1,
          },
        ];

        const queryRunner = dataSource.createQueryRunner();
        const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
        const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
        const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
        const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

        const result = await eventService.eventDistributor(eventDto);

        expect(result).toEqual(testResult);
        expect(qrSpyOnSave).toHaveBeenCalledTimes(2);
        expect(qrSpyOnCommit).toHaveBeenCalledTimes(2);
        expect(qrSpyOnRollback).toHaveBeenCalledTimes(0);
        expect(qrSpyOnRelease).toHaveBeenCalledTimes(2);
      });
      it('ADD - no Photo - no First Write', async () => {
        const eventDto: EventDto = {
          type: EventTypeFormat.REVIEW,
          action: ActionFormat.ADD,
          reviewId: '1',
          content: '1',
          attachedPhotoIds: [],
          userId: '1',
          placeId: '1',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          nickName: '1',
          email: '1',
          password: '1',
          level: 1,
        });
        jest.spyOn(reviewRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          content: '1',
          point: [],
        });
        jest
          .spyOn(reviewRepository, 'findOne')
          .mockResolvedValueOnce({ id: '2' });
        jest.spyOn(pointRepository, 'find').mockResolvedValueOnce([]);
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          reason: ReasonFormat.REVIEW_ADD,
          score: 2,
        });

        const testResult = [{ reason: ReasonFormat.REVIEW_ADD, score: 2 }];

        const queryRunner = dataSource.createQueryRunner();
        const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
        const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
        const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
        const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

        const result = await eventService.eventDistributor(eventDto);

        expect(result).toEqual(testResult);
        expect(qrSpyOnSave).toBeCalledTimes(1);
        expect(qrSpyOnCommit).toBeCalledTimes(3);
        expect(qrSpyOnRollback).toBeCalledTimes(0);
        expect(qrSpyOnRelease).toBeCalledTimes(3);
      });
    });

    describe('MOD', () => {
      it('MOD - ADD PHOTO', async () => {
        const eventDto: EventDto = {
          type: EventTypeFormat.REVIEW,
          action: ActionFormat.MOD,
          reviewId: '1',
          content: '1',
          attachedPhotoIds: ['a'],
          userId: '1',
          placeId: '1',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          nickName: '1',
          email: '1',
          password: '1',
          level: 1,
        });
        jest.spyOn(reviewRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          content: '1',
          images: [],
          point: [{ score: 1 }],
        });
        jest
          .spyOn(reviewRepository, 'findOne')
          .mockResolvedValueOnce({ id: '1' });
        jest
          .spyOn(pointRepository, 'find')
          .mockResolvedValueOnce([
            { score: 1, reason: ReasonFormat.REVIEW_ADD },
            { score: 1 },
          ]);
        jest
          .spyOn(pointRepository, 'find')
          .mockResolvedValueOnce([
            { score: 1, reason: ReasonFormat.REVIEW_ADD },
            { score: 1 },
            { score: 1, reason: ReasonFormat.REVIEW_MOD_ADD_PHOTO },
          ]);
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          score: 1,
          reason: ReasonFormat.REVIEW_MOD_ADD_PHOTO,
        });

        const result = await eventService.eventDistributor(eventDto);
        expect(result).toEqual({
          score: 1,
          reason: ReasonFormat.REVIEW_MOD_ADD_PHOTO,
        });
        const queryRunner = dataSource.createQueryRunner();
        const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
        const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
        const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
        const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

        expect(qrSpyOnSave).toBeCalledTimes(1);
        expect(qrSpyOnCommit).toBeCalledTimes(4);
        expect(qrSpyOnRollback).toBeCalledTimes(0);
        expect(qrSpyOnRelease).toBeCalledTimes(4);
      });
      it('MOD - DELETE PHOTO', async () => {
        const eventDto: EventDto = {
          type: EventTypeFormat.REVIEW,
          action: ActionFormat.MOD,
          reviewId: '1',
          content: '1',
          attachedPhotoIds: [],
          userId: '1',
          placeId: '1',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          nickName: '1',
          email: '1',
          password: '1',
          level: 1,
        });
        jest.spyOn(reviewRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          content: '1',
          images: ['a'],
          point: [{ score: 1 }],
        });
        jest
          .spyOn(reviewRepository, 'findOne')
          .mockResolvedValueOnce({ id: '1' });
        jest
          .spyOn(pointRepository, 'find')
          .mockResolvedValueOnce([
            { score: 2, reason: ReasonFormat.REVIEW_ADD_with_PHOTO },
            { score: 1 },
          ]);
        jest
          .spyOn(pointRepository, 'find')
          .mockResolvedValueOnce([
            { score: 2, reason: ReasonFormat.REVIEW_ADD_with_PHOTO },
            { score: 1 },
            { score: -1, reason: ReasonFormat.REVIEW_MOD_DELETE_PHOTO },
          ]);
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          score: -1,
          reason: ReasonFormat.REVIEW_MOD_DELETE_PHOTO,
        });

        const result = await eventService.eventDistributor(eventDto);
        expect(result).toEqual({
          score: -1,
          reason: ReasonFormat.REVIEW_MOD_DELETE_PHOTO,
        });
        const queryRunner = dataSource.createQueryRunner();
        const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
        const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
        const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
        const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

        expect(qrSpyOnSave).toBeCalledTimes(1);
        expect(qrSpyOnCommit).toBeCalledTimes(5);
        expect(qrSpyOnRollback).toBeCalledTimes(0);
        expect(qrSpyOnRelease).toBeCalledTimes(5);
      });
    });

    describe('DELETE', () => {
      it('DELETE - No Photo', async () => {
        const eventDto: EventDto = {
          type: EventTypeFormat.REVIEW,
          action: ActionFormat.DELETE,
          reviewId: '1',
          content: '1',
          attachedPhotoIds: [],
          userId: '1',
          placeId: '1',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          nickName: '1',
          email: '1',
          password: '1',
          level: 1,
        });
        jest.spyOn(reviewRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          content: '1',
          images: ['a'],
          point: [{ score: 1 }],
        });
        jest
          .spyOn(pointRepository, 'find')
          .mockResolvedValue([{ score: 1, reason: ReasonFormat.REVIEW_ADD }]);
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          score: -1,
          reason: ReasonFormat.REVIEW_DELETE,
        });
        jest.spyOn(pointRepository, 'find').mockResolvedValueOnce([
          { score: 1, reason: ReasonFormat.REVIEW_ADD },
          {
            score: -1,
            reason: ReasonFormat.REVIEW_DELETE,
          },
        ]);

        const queryRunner = dataSource.createQueryRunner();
        jest.spyOn(queryRunner.manager, 'save').mockResolvedValueOnce({
          score: -1,
          reason: ReasonFormat.REVIEW_DELETE,
        });

        const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
        const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
        const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
        const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

        const result = await eventService.eventDistributor(eventDto);
        expect(result).toEqual([
          { score: -1, reason: ReasonFormat.REVIEW_DELETE },
        ]);

        expect(qrSpyOnSave).toBeCalledTimes(1);
        expect(qrSpyOnCommit).toBeCalledTimes(6);
        expect(qrSpyOnRollback).toBeCalledTimes(0);
        expect(qrSpyOnRelease).toBeCalledTimes(6);
      });

      it('DELETE - No Photo With FirstWrite', async () => {
        const eventDto: EventDto = {
          type: EventTypeFormat.REVIEW,
          action: ActionFormat.DELETE,
          reviewId: '1',
          content: '1',
          attachedPhotoIds: [],
          userId: '1',
          placeId: '1',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          nickName: '1',
          email: '1',
          password: '1',
          level: 1,
        });
        jest.spyOn(reviewRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          content: '1',
          images: [],
          point: [{ score: 1 }, { score: 1 }],
        });
        jest.spyOn(pointRepository, 'find').mockResolvedValueOnce([
          { score: 1, reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE },
          { score: 1, reason: ReasonFormat.REVIEW_ADD },
        ]);
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          score: -1,
          reason: ReasonFormat.REVIEW_DELETE,
        });
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          score: -1,
          reason: ReasonFormat.REVIEW_DELETE_FIRST_PLACE,
        });
        jest.spyOn(pointRepository, 'find').mockResolvedValueOnce([
          { score: 1, reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE },
          { score: 1, reason: ReasonFormat.REVIEW_ADD },
          {
            score: -1,
            reason: ReasonFormat.REVIEW_DELETE,
          },
        ]);

        const queryRunner = dataSource.createQueryRunner();

        const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
        const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
        const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
        const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

        const result = await eventService.eventDistributor(eventDto);

        expect(result).toEqual([
          { score: -1, reason: ReasonFormat.REVIEW_DELETE },
          { score: -1, reason: ReasonFormat.REVIEW_DELETE_FIRST_PLACE },
        ]);
        expect(qrSpyOnSave).toBeCalledTimes(2);
        expect(qrSpyOnCommit).toBeCalledTimes(7);
        expect(qrSpyOnRollback).toBeCalledTimes(0);
        expect(qrSpyOnRelease).toBeCalledTimes(7);
      });

      it('DELETE - With Photo', async () => {
        const eventDto: EventDto = {
          type: EventTypeFormat.REVIEW,
          action: ActionFormat.DELETE,
          reviewId: '1',
          content: '1',
          attachedPhotoIds: ['a'],
          userId: '1',
          placeId: '1',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          nickName: '1',
          email: '1',
          password: '1',
          level: 1,
        });
        jest.spyOn(reviewRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          content: '1',
          images: ['a'],
          point: [{ score: 2 }],
        });
        jest
          .spyOn(pointRepository, 'find')
          .mockResolvedValue([
            { score: 2, reason: ReasonFormat.REVIEW_ADD_with_PHOTO },
          ]);
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          score: -2,
          reason: ReasonFormat.REVIEW_DELETE_with_PHOTO,
        });
        jest.spyOn(pointRepository, 'find').mockResolvedValueOnce([
          { score: 2, reason: ReasonFormat.REVIEW_ADD_with_PHOTO },
          {
            score: -2,
            reason: ReasonFormat.REVIEW_DELETE_with_PHOTO,
          },
        ]);
        const queryRunner = dataSource.createQueryRunner();

        const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
        const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
        const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
        const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');
        jest.spyOn(queryRunner.manager, 'save').mockResolvedValueOnce({
          score: -2,
          reason: ReasonFormat.REVIEW_DELETE_with_PHOTO,
        });

        const result = await eventService.eventDistributor(eventDto);
        expect(result).toEqual([
          { score: -2, reason: ReasonFormat.REVIEW_DELETE_with_PHOTO },
        ]);
        expect(qrSpyOnSave).toBeCalledTimes(1);
        expect(qrSpyOnCommit).toBeCalledTimes(8);
        expect(qrSpyOnRollback).toBeCalledTimes(0);
        expect(qrSpyOnRelease).toBeCalledTimes(8);
      });

      it('DELETE - With Photo With FirstWrite', async () => {
        const eventDto: EventDto = {
          type: EventTypeFormat.REVIEW,
          action: ActionFormat.DELETE,
          reviewId: '1',
          content: '1',
          attachedPhotoIds: ['a'],
          userId: '1',
          placeId: '1',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          nickName: '1',
          email: '1',
          password: '1',
          level: 1,
        });
        jest.spyOn(reviewRepository, 'findOne').mockResolvedValueOnce({
          id: '1',
          content: '1',
          images: ['a'],
          point: [{ score: 1 }, { score: 2 }],
        });
        jest.spyOn(pointRepository, 'find').mockResolvedValueOnce([
          { score: 1, reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE },
          { score: 2, reason: ReasonFormat.REVIEW_ADD_with_PHOTO },
        ]);
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          score: -2,
          reason: ReasonFormat.REVIEW_DELETE_with_PHOTO,
        });
        jest.spyOn(pointRepository, 'create').mockResolvedValueOnce({
          score: -1,
          reason: ReasonFormat.REVIEW_DELETE_FIRST_PLACE,
        });
        jest.spyOn(pointRepository, 'find').mockResolvedValueOnce([
          { score: 1, reason: ReasonFormat.REVIEW_ADD_FIRST_PLACE },
          { score: 2, reason: ReasonFormat.REVIEW_ADD_with_PHOTO },
          {
            score: -1,
            reason: ReasonFormat.REVIEW_DELETE_with_PHOTO,
          },
          { score: -1, reason: ReasonFormat.REVIEW_DELETE_FIRST_PLACE },
        ]);

        const queryRunner = dataSource.createQueryRunner();

        const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
        const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
        const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
        const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');

        const result = await eventService.eventDistributor(eventDto);

        expect(result).toEqual([
          { score: -2, reason: ReasonFormat.REVIEW_DELETE_with_PHOTO },
          { score: -1, reason: ReasonFormat.REVIEW_DELETE_FIRST_PLACE },
        ]);
        expect(qrSpyOnSave).toBeCalledTimes(2);
        expect(qrSpyOnCommit).toBeCalledTimes(9);
        expect(qrSpyOnRollback).toBeCalledTimes(0);
        expect(qrSpyOnRelease).toBeCalledTimes(9);
      });
    });
  });
});
