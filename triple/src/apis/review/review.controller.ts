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
  ApiCreatedResponse,
  ApiOperation,
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

  @Post()
  @ApiOperation({
    summary: '리뷰 생성',
    description: '리뷰를 생성합니다',
  })
  @ApiCreatedResponse({
    description: '리뷰 생성 성공',
    type: EventDto,
  })
  @ApiBadRequestResponse({
    description: '필수값이 존재하지 않거나 유저, 장소가 존재하지 않는경우',
    status: 400,
  })
  create(@Body(ValidationPipe) createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Patch(':reviewId')
  @ApiOperation({
    summary: '리뷰 수정',
    description: '리뷰를 수정합니다',
  })
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
  ) {
    return this.reviewService.update(reviewId, updateReviewDto);
  }

  @Delete(':reviewId')
  @ApiOperation({
    summary: '리뷰 삭제',
    description: '리뷰를 삭제합니다',
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 삭제 성공',
    type: EventDto,
  })
  @ApiBadRequestResponse({
    description: '리뷰가 존재하지 않는경우.',
    status: 400,
  })
  delete(@Param('reviewId') reviewId: string) {
    return this.reviewService.delete(reviewId);
  }

  @Get(':id')
  @ApiOperation({
    summary: '리뷰 조회',
    description: '리뷰를 UUID로 조회합니다',
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 조회 성공',
    type: Review,
  })
  @ApiBadRequestResponse({
    description: '리뷰가 존재하지 않는경우.',
    status: 400,
  })
  findOne(@Param('id') id: string) {
    return this.reviewService.findOneById(id);
  }

  @Get('/me/:userId')
  @ApiOperation({
    summary: '내 리뷰 조회',
    description: '내 리뷰를 조회합니다',
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 조회 성공',
    type: [Review],
  })
  findAllByUserId(@Param('userId') userId: string) {
    return this.reviewService.findAllByUserId(userId);
  }
}
