import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/createUserDto';
import { UpdateUserDto } from './dto/updateUserDto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * @author SJY0917032
   * @description 모든 유저를 반환합니다.
   *
   * @returns { Promise<User[]> } 유저 목록을 반환합니다.
   */
  async findAll(): Promise<User[]> {
    const results = this.userRepository.find();
    return results;
  }

  /**
   * @author SJY0917032
   * @description 유저를 생성합니다.
   *
   * @param createUserDto 생성할 유저의 정보를 담은 DTO입니다.
   * @returns { Promise<User> } 생성된 유저를 반환합니다.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
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
   * @author SJY0917032
   * @description 유저를 수정합니다.
   *
   * @param email 변경할 유저의 이메일
   * @param updateUserDto 변경할 내용을담은 DTO입니다.
   * @returns { Promise<User> } 수정된 유저를 반환합니다.
   */
  async update(email: string, updateUserDto: UpdateUserDto): Promise<User> {
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
   * @author SJY0917032
   * @description 유저를 삭제합니다.
   *
   * @param email 삭제할 User
   * @returns { Promise<boolean> } 삭제 여부를 반환합니다.
   */
  async delete(email: string): Promise<boolean> {
    const userExists = await this.checkUserExists(email);

    if (!userExists) {
      throw new BadRequestException('유저가 존재하지 않습니다.');
    }

    const deleteResult = await this.userRepository.softRemove(userExists);

    return deleteResult ? true : false;
  }

  /**
   * @author SJY0917032
   * @description 이메일을 검증합니다.
   *
   * @param email 이메일
   * @returns Promise<User> OR Null 검증한 유저를 반환합니다.
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
