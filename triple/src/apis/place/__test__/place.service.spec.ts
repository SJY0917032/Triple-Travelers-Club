import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Place } from '../entities/place.entity';
import { PlaceService } from '../place.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

describe('PlaceService', () => {
  let placeService: PlaceService;
  let placeRepository: MockRepository<Place>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PlaceService,
        { provide: 'PlaceRepository', useFactory: mockRepository },
      ],
    }).compile();

    placeService = module.get<PlaceService>(PlaceService);
    placeRepository = module.get('PlaceRepository') as MockRepository<Place>;
  });

  it('should be defined', () => {
    expect(placeService).toBeDefined();
  });

  describe('findAll', () => {
    it('장소의 배열을 반환합니다.', async () => {
      const places = [{ id: '1', name: '오사카' }];
      placeRepository.find.mockResolvedValue(places);

      const placeRepositorySpyFind = jest.spyOn(placeRepository, 'find');

      expect(await placeService.findAll()).toEqual(places);
      expect(placeRepositorySpyFind).toBeCalledTimes(1);
    });
  });

  describe('findByName', () => {
    it('장소를 반환합니다.', async () => {
      const place = { id: '1', name: '오사카' };
      placeRepository.findOne.mockResolvedValue(place);

      const placeRepositorySpyFindOne = jest.spyOn(placeRepository, 'findOne');

      expect(await placeService.findByName('오사카')).toEqual(place);
      expect(placeRepositorySpyFindOne).toBeCalledTimes(1);
    });

    it('해당 장소가 없습니다.', async () => {
      placeRepository.findOne.mockResolvedValue(null);

      await expect(placeService.findByName('오사카')).rejects.toThrowError(
        '해당 장소는 존재하지 않습니다.',
      );
      const placeRepositorySpyFindOne = jest.spyOn(placeRepository, 'findOne');
      expect(placeRepositorySpyFindOne).toBeCalledTimes(1);
    });
  });

  describe('create', () => {
    it('장소를 생성합니다.', async () => {
      const place = { name: '오사카' };
      placeRepository.save.mockResolvedValue(place);

      const placeRepositorySpySave = jest.spyOn(placeRepository, 'save');
      const placeRepositorySpyFindOne = jest.spyOn(placeRepository, 'findOne');

      expect(await placeService.create(place)).toEqual(place);
      expect(placeRepositorySpySave).toBeCalledTimes(1);
      expect(placeRepositorySpyFindOne).toBeCalledTimes(1);
    });

    it('장소가 이미 존재합니다.', async () => {
      placeRepository.findOne.mockResolvedValue({ id: '1', name: '오사카' });

      await expect(
        placeService.create({ name: '오사카' }),
      ).rejects.toThrowError('이미 존재하는 장소입니다.');
      const placeRepositorySpyFindOne = jest.spyOn(placeRepository, 'findOne');
      expect(placeRepositorySpyFindOne).toBeCalledTimes(1);
    });
  });
});
