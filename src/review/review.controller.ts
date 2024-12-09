import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewDto, ReviewListDto } from './dto/review.dto';
import { CreateReviewPayload } from './payload/create-review.payload';
import { ReviewQuery } from './query/review.query';
import { PutUpdateReviewPayload } from './payload/put-update-review.payload';
import { PatchUpdateReviewPayload } from './payload/patch-update-review.payload';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';

@Controller('reviews')
@ApiTags('Review API')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰를 생성합니다' })
  @ApiCreatedResponse({ type: ReviewDto })
  async createReview(
    @Body() payload: CreateReviewPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReviewDto> {
    return this.reviewService.createReview(payload, user);
  }

  @Get(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰 상세 정보를 가져옵니다' })
  @ApiOkResponse({ type: ReviewDto })
  async getReviewById(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReviewDto> {
    return this.reviewService.getReviewById(reviewId, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '여러 리뷰 정보를 가져옵니다' })
  @ApiOkResponse({ type: ReviewListDto })
  async getReviews(
    @Query() query: ReviewQuery,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReviewListDto> {
    return this.reviewService.getReviews(query, user);
  }

  @Put(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰를 수정합니다' })
  @ApiOkResponse({ type: ReviewDto })
  async putUpdateReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() payload: PutUpdateReviewPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReviewDto> {
    return this.reviewService.putUpdateReview(reviewId, payload, user);
  }

  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰를 수정합니다' })
  @ApiOkResponse({ type: ReviewDto })
  async patchUpdateReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() payload: PatchUpdateReviewPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReviewDto> {
    return this.reviewService.patchUpdateReview(reviewId, payload, user);
  }

  @Delete(':reviewId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰를 삭제합니다' })
  @ApiNoContentResponse()
  async deleteReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.reviewService.deleteReview(reviewId, user);
  }
}
