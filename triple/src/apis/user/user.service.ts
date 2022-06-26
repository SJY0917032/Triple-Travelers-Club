import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Review } from '../review/entities/review.entity';

import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/createUserDto';
import { UpdateUserDto } from './dto/updateUserDto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  /**
   * 모든 유저를 반환합니다.
   *
   * @returns 모든 유저를 반환합니다.
   */
  async findAll() {
    const results = this.userRepository.find();
    return results;
  }

  /**
   * 유저를 생성합니다.
   *
   * @param createUserDto 생성할 유저의 정보를담은 DTO입니다.
   * @returns 생성된 유저를 반환합니다.
   */
  async create(createUserDto: CreateUserDto) {
    const { nickName, email, password } = createUserDto;

    const userExists = await this.checkUserExists(email);
    if (userExists) {
      throw new UnprocessableEntityException('이미 존재하는 이메일입니다.');
    }

    const user = await this.userRepository.save({
      nickName: nickName,
      email: email,
      password: await bcrypt.hash(password, 10),
    });

    return user;
  }

  /**
   * 유저를 수정합니다.
   *
   * @param email 변경할 유저의 이메일
   * @param updateUserDto 변경할 내용을담은 DTO입니다.
   * @returns 변경된 유저를 반환합니다.
   */
  async update(email: string, updateUserDto: UpdateUserDto) {
    const { nickName } = updateUserDto;

    const userExists = await this.checkUserExists(email);

    if (!userExists) {
      throw new BadRequestException('유저가 존재하지 않습니다.');
    }

    const user = await this.userRepository.save({
      ...userExists,
      nickName: nickName,
    });

    return user;
  }

  /**
   * 유저를 삭제합니다.
   *
   * @param email 삭제할 User
   * @returns 삭제된 결과를 boolean형태로 반환합니다.
   */
  async delete(email: string) {
    const userExists = await this.checkUserExists(email);

    if (!userExists) {
      throw new BadRequestException('유저가 존재하지 않습니다.');
    }

    const deleteResult = await this.userRepository.softRemove(userExists);

    return deleteResult ? true : false;
  }

  /**
   * 이메일을 검증합니다.
   *
   * @param email 이메일
   * @returns 검증한 유저를 반환합니다.
   */
  private async checkUserExists(email: string): Promise<User> | null {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
      relations: ['reviews'],
    });
    return user;
  }
}
