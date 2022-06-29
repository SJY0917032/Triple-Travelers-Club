import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserPointDto } from './dto/userPointDto';
import { Point } from './entities/point.entity';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * @author SJY0917032
   * @description 유저 ID (UUID)로 유저의 포인트 합산을 조회합니다.
   *
   * @param userId 유저 ID (UUID)
   * @returns {Promise<UserPointDto>} 유저의 포인트 합산을 반환합니다.
   */
  async findUserTotalPoint(userId: string): Promise<UserPointDto> {
    const user = await this.checkUser(userId);
    const userPoint = await this.checkPointByUser(user);

    if (userPoint.length !== 0) {
      const totalPoint = userPoint.reduce(
        (acc, cur) => acc + Number(cur.score),
        0,
      );
      return { user, totalPoint };
    }
    return { user, totalPoint: 0 };
  }

  /**
   * @author SJY0917032
   * @description 유저 ID (UUID)로 유저의 포인트 내역을 조회합니다.
   *
   * @param userId 유저 ID (UUID)
   * @returns {Promise<Point[]>} 유저의 포인트 내역을 반환합니다.
   */
  async findAllByUserId(userId: string): Promise<Point[]> {
    const user = await this.checkUser(userId);
    const userPoint = await this.checkPointByUser(user);

    return userPoint;
  }

  /**
   * @author SJY0917032
   * @description 모든 유저의 포인트의 증감 이력을 조회합니다
   *
   * @returns {Promise<Point[]>} 모든 유저의 포인트의 증감 이력을 반환합니다.
   */
  async findAll(): Promise<Point[]> {
    const point = await this.pointRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });

    return point;
  }

  /**
   * @author SJY0917032
   * @description 유저 ID (UUID)로 유저를 조회합니다.
   *
   * @param userId 유저 ID (UUID)
   * @returns {Promise<User>} 유저를 반환합니다.
   */
  private async checkUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('조회하려는 유저가 존재하지 않습니다.');
    }

    return user;
  }

  /**
   * @author SJY0917032
   * @description 유저로 포인트 내역을 조회합니다.
   *
   * @param {User} user 유저
   * @returns {Promise<Point[]>} 유저의 포인트 내역을 반환합니다.
   */
  private async checkPointByUser(user: User): Promise<Point[]> {
    const userPoint = await this.pointRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['user', 'review'],
      order: {
        createdAt: 'DESC',
      },
    });

    return userPoint;
  }
}
