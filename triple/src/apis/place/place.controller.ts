import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/createPlaceDto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Place } from './entities/place.entity';

@ApiTags('Place')
@Controller('place')
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService, //
  ) {}

  /**
   * @author SJY0917032
   * @description 모든 장소를 조회합니다
   *
   * @returns {Promise<Place[]>} Place를 배열형태로 반환합니다.
   */
  @Get()
  @ApiOperation({
    summary: '모든 장소 조회',
    description: '모든 장소를 조회합니다',
  })
  @ApiResponse({
    status: 200,
    description: '장소 조회를 성공했습니다.',
    type: [Place],
  })
  findAll(): Promise<Place[]> {
    return this.placeService.findAll();
  }

  /**
   * @author SJY0917032
   * @description 이름으로 장소를 한개 조회합니다.
   *
   * @param name 장소의 이름
   * @returns {Promise<Place>} 장소를 반환합니다.
   */
  @Get(':name')
  @ApiOperation({
    summary: '장소를 이름으로 조회합니다.',
    description: '장소를 이름으로 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '장소 조회를 성공했습니다.',
    type: Place,
  })
  @ApiBadRequestResponse({
    description: '장소 조회를 실패했습니다.',
    schema: {
      example: '해당 장소는 존재하지 않습니다.',
    },
  })
  findByName(
    @Param('name') name: string, //
  ): Promise<Place> {
    return this.placeService.findByName(name);
  }

  /**
   * @author SJY0917032
   * @description 장소를 생성합니다.
   *
   * createPlaceDto를 사용해 장소를 생성합니다.
   */
  @Post()
  @ApiOperation({
    summary: '장소를 생성합니다',
    description: '장소를 생성합니다',
  })
  @ApiCreatedResponse({
    description: '장소 생성을 성공했습니다.',
    type: Place,
  })
  @ApiUnprocessableEntityResponse({
    description: '장소 이름이 겹쳐 생성에 실패했습니다.',
    schema: {
      example: '이미 존재하는 장소입니다.',
    },
  })
  create(@Body(ValidationPipe) createPlaceDto: CreatePlaceDto) {
    return this.placeService.create(createPlaceDto);
  }
}
