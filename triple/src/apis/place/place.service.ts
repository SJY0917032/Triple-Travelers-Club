import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from './entities/place.entity';
import { CreatePlaceDto } from './dto/createPlaceDto';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>, //
  ) {}

  /**
   * 모든 장소를 조회합니다.
   *
   * @returns 모든 장소를 반환합니다.
   */
  async findAll() {
    const result = await this.placeRepository.find();

    return result;
  }

  /**
   * 장소를 이름으로 조회합니다.
   *
   * @param name 조회할 장소의 이름입니다.
   * @returns 조회한 장소를 반환힙니다.
   */
  async findByName(name: string) {
    const findResult = await this.placeRepository.findOne({
      where: {
        name: name,
      },
      relations: ['reviews'],
    });

    if (!findResult) {
      throw new BadRequestException('해당 장소는 존재하지 않습니다.');
    }

    return findResult;
  }

  /**
   * 장소를 생성합니다.
   *
   * @param createPlaceDto 생성할 장소의 정보를 담은 DTO입니다.
   * @returns 생성된 장소를 반환합니다.
   */
  async create(createPlaceDto: CreatePlaceDto) {
    const { name } = createPlaceDto;

    const placeExists = await this.checkPlaceExists(name);
    if (placeExists) {
      throw new UnprocessableEntityException('이미 존재하는 장소입니다.');
    }

    const place = await this.placeRepository.save({
      name: name,
    });

    return place;
  }

  /**
   * 장소를 검증합니다.
   *
   * @param name 장소의 이름
   * @returns 검증한 장소를 반환합니다.
   */
  private async checkPlaceExists(name: string): Promise<Place> | null {
    const place = await this.placeRepository.findOne({
      where: {
        name: name,
      },
      relations: ['reviews'],
    });
    return place;
  }
}
