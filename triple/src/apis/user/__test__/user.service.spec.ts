import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/createUserDto';
import { UpdateUserDto } from '../dto/updateUserDto';
import { User } from '../entities/user.entity';
import { UserService } from '../user.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  softRemove: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserRepository', useFactory: mockRepository },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get('UserRepository') as MockRepository<User>;
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findAll', () => {
    it('유저의 배열을 반환합니다.', async () => {
      const users = [{ id: 1, name: 'John Doe' }];
      userRepository.find.mockResolvedValue(users);

      const userRepositorySpyFind = jest.spyOn(userRepository, 'find');

      expect(await userService.findAll()).toEqual(users);
      expect(userRepositorySpyFind).toBeCalledTimes(1);
    });
  });

  describe('create', () => {
    it('유저 생성 완료', async () => {
      const user = { nickName: '1', email: '1', password: '1' };
      userRepository.save.mockResolvedValue(user);

      const userRepositorySpySave = jest.spyOn(userRepository, 'save');
      const userRepositorySpyFindOne = jest.spyOn(userRepository, 'findOne');

      const result = await userService.create({
        nickName: '1',
        email: '1',
        password: '1',
      } as CreateUserDto);

      expect(result).toEqual(user);
      expect(userRepositorySpySave).toBeCalledTimes(1);
      expect(userRepositorySpyFindOne).toBeCalledTimes(1);
    });

    it('이미 존재하는 이메일입니다', async () => {
      userRepository.findOne.mockResolvedValue(true);

      await expect(
        userService.create({
          nickName: '1',
          email: '1',
          password: '1',
        } as CreateUserDto),
      ).rejects.toThrowError('이미 존재하는 이메일입니다.');
    });
  });

  describe('update', () => {
    it('유저 수정 완료', async () => {
      const user = { nickName: '1', email: '1', password: '1' };
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue(user);

      const userRepositorySpyFindOne = jest.spyOn(userRepository, 'findOne');
      const userRepositorySpySave = jest.spyOn(userRepository, 'save');

      await userService.update('1', {
        nickName: '2',
      } as UpdateUserDto);

      expect(userRepositorySpyFindOne).toBeCalledTimes(1);
      expect(userRepositorySpySave).toBeCalledTimes(1);
    });

    it('유저가 존재하지 않습니다.', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        userService.update('1', {
          nickName: '2',
        } as UpdateUserDto),
      ).rejects.toThrowError('유저가 존재하지 않습니다.');
    });
  });

  describe('delete', () => {
    it('유저 삭제 완료', async () => {
      const user = { id: '1', nickName: '1', email: '1', password: '1' };
      userRepository.findOne.mockResolvedValue(user);

      userRepository.softRemove.mockResolvedValue(user);

      await userService.delete('1');

      const userRepositorySpyFindOne = jest.spyOn(userRepository, 'findOne');
      const userRepositorySpySoftRemove = jest.spyOn(
        userRepository,
        'softRemove',
      );

      expect(userRepositorySpyFindOne).toBeCalledTimes(1);
      expect(userRepositorySpySoftRemove).toBeCalledTimes(1);
    });

    it('유저가 존재하지 않습니다.', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(userService.delete('1')).rejects.toThrowError(
        '유저가 존재하지 않습니다.',
      );
    });
  });
});
