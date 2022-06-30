import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReviewDto } from './dto/createReviewDto';
import { UpdateReviewDto } from './dto/updateReviewDto';
import { Review } from './entities/review.entity';
import { ReviewService } from './review.service';
import { EventDto } from '../event/dto/eventDto';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService, //
  ) {}

  /**
   * @author SJY0917032
   * @description 리뷰를 생성합니다.
   *
   * @returns {Promise<EventDto>} ADD EventDto를 생성해 리턴합니다.
   */
  @Post()
  @ApiOperation({
    summary: '리뷰 생성',
    description: '리뷰를 생성합니다',
  })
  @ApiBody({ type: CreateReviewDto })
  @ApiCreatedResponse({
    description: '리뷰 생성 성공',
    type: EventDto,
  })
  @ApiBadRequestResponse({
    description: '필수값이 존재하지 않거나 유저, 장소가 존재하지 않는경우',
    status: 400,
  })
  create(
    @Body(ValidationPipe) createReviewDto: CreateReviewDto,
  ): Promise<EventDto> {
    return this.reviewService.create(createReviewDto);
  }

  /**
   * @author SJY0917032
   * @description 리뷰를 수정합니다.
   *
   * @param reviewId 리뷰 아이디 (UUID)
   * @returns {Promise<EventDto>}  MOD EventDto를 생성해 리턴합니다.
   */
  @Patch(':reviewId')
  @ApiOperation({
    summary: '리뷰 수정',
    description: '리뷰를 수정합니다',
  })
  @ApiBody({ type: UpdateReviewDto })
  @ApiParam({ type: String, name: 'reviewId' })
  @ApiResponse({
    status: 200,
    description: '리뷰 수정 성공',
    type: EventDto,
  })
  @ApiBadRequestResponse({
    description: '리뷰가 존재하지 않는경우.',
    status: 400,
  })
  update(
    @Param('reviewId') reviewId: string,
    @Body(ValidationPipe) updateReviewDto: UpdateReviewDto,
  ): Promise<EventDto> {
    return this.reviewService.update(reviewId, updateReviewDto);
  }

  /**
   * @author SJY0917032
   * @description 리뷰를 수정합니다.
   *
   * @param reviewId 삭제할 리뷰 아이디 (UUID)
   * @returns {Promise<EventDto>} DELETE EventDto를 생성해 리턴합니다.
   */
  @Delete(':reviewId')
  @ApiOperation({
    summary: '리뷰 삭제',
    description: '리뷰를 삭제합니다',
  })
  @ApiParam({ type: String, name: 'reviewId' })
  @ApiResponse({
    status: 200,
    description: '리뷰 삭제 성공',
    type: EventDto,
  })
  @ApiBadRequestResponse({
    description: '리뷰가 존재하지 않는경우.',
    status: 400,
  })
  delete(@Param('reviewId') reviewId: string): Promise<EventDto> {
    return this.reviewService.delete(reviewId);
  }

  /**
   * @author SJY0917032
   * @description 리뷰를 ID로 조회합니다.
   *
   * @param reviewId 단일 조회할 리뷰의 ID (UUID)
   * @returns {Promise<Review>} 조회한 REVIEW를 반환합니다.
   */
  @Get(':reviewId')
  @ApiOperation({
    summary: '리뷰 조회',
    description: '리뷰를 UUID로 조회합니다',
  })
  @ApiParam({ type: String, name: 'reviewId' })
  @ApiResponse({
    status: 200,
    description: '리뷰 조회 성공',
    type: Review,
  })
  @ApiBadRequestResponse({
    description: '리뷰가 존재하지 않는경우.',
    status: 400,
  })
  findOne(@Param('reviewId') reviewId: string): Promise<Review> {
    return this.reviewService.findOneById(reviewId);
  }

  /**
   * @author SJY0917032
   * @description 유저의 리뷰를 조회합니다.
   *
   * @param userId 리뷰를 조회할 유저의 ID (UUID)
   * @returns {Promise<Review[]>} 조회한 유저의 리뷰를 반환합니다.
   */
  @Get('/me/:userId')
  @ApiOperation({
    summary: '내 리뷰 조회',
    description: '내 리뷰를 조회합니다',
  })
  @ApiParam({ type: String, name: 'userId' })
  @ApiResponse({
    status: 200,
    description: '리뷰 조회 성공',
    type: [Review],
  })
  findAllByUserId(@Param('userId') userId: string): Promise<Review[]> {
    return this.reviewService.findAllByUserId(userId);
  }

  @Get()
  @ApiOperation({
    summary: '리뷰 전체 조회',
    description: '리뷰를 전체 조회합니다',
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 전체 조회 성공',
    type: [Review],
  })
  findAll() {
    return this.reviewService.findAll();
  }
}
