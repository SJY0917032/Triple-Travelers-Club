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
import { CreateReviewDto } from './dto/createReviewDto';
import { UpdateReviewDto } from './dto/updateReviewDto';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService, //
  ) {}

  @Post()
  create(@Body(ValidationPipe) createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Patch(':reviewId')
  update(
    @Param('reviewId') reviewId: string,
    @Body(ValidationPipe) updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.update(reviewId, updateReviewDto);
  }

  @Delete(':reviewId')
  delete(@Param('reviewId') reviewId: string) {
    return this.reviewService.delete(reviewId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOneById(id);
  }

  @Get('/me/:userId')
  findAllByUserId(@Param('userId') userId: string) {
    return this.reviewService.findAllByUserId(userId);
  }
}
