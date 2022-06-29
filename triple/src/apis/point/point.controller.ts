import { Controller, Get } from '@nestjs/common';
import { PointService } from './point.service';
import { UserPointDto } from './dto/userPointDto';
import { Point } from './entities/point.entity';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Point')
@Controller('point')
export class PointController {
  constructor(
    private readonly pointService: PointService, //
  ) {}

  /**
   * @author SJY0917032
   * @description 유저 ID (UUID)로 유저의 포인트 합산을 조회합니다.
   *
   * @param userId 유저 ID (UUID)
   * @returns {Promise<UserPointDto>} 유저와, 포인트 합산을 반환합니다.
   */
  @Get('/total/:userId')
  @ApiOperation({
    summary: '유저의 포인트 합산',
    description: '유저의 포인트 합산을 구합니다',
  })
  @ApiResponse({
    status: 200,
    description: '유저의 전체 포인트를 성공적으로 조회했습니다.',
    type: UserPointDto,
  })
  @ApiBadRequestResponse({
    description: '유저가 존재하지 않습니다.',
    schema: {
      example: '해당 유저가 존재하지 않습니다.',
    },
  })
  userTotalPoint(userId: string): Promise<UserPointDto> {
    return this.pointService.findUserTotalPoint(userId);
  }

  /**
   * @author SJY0917032
   * @description 유저 ID (UUID)로 유저의 포인트 내역을 조회합니다.
   *
   * @param userId 유저 ID (UUID)
   * @returns {Promise<Point[]>} 유저의 포인트 목록을 반환합니다.
   */
  @Get(':userId')
  @ApiOperation({
    summary: '유저의 전체 포인트 목록 조회',
    description: '유저의 전체 포인트 목록을 조회합니다',
  })
  @ApiResponse({
    status: 200,
    description: '유저의 전체 포인트를 성공적으로 조회했습니다.',
    type: [Point],
  })
  @ApiBadRequestResponse({
    description: '유저가 존재하지 않습니다.',
    schema: {
      example: '해당 유저가 존재하지 않습니다.',
    },
  })
  findAllByUserId(userId: string): Promise<Point[]> {
    return this.pointService.findAllByUserId(userId);
  }
}
