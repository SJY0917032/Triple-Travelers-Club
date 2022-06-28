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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUserDto';
import { UpdateUserDto } from './dto/updateUserDto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService, //
  ) {}

  /**
   * @author SJY0917032
   * @description 유저를 전체 조회합니다.
   *
   * @returns {Promise<User[]>} 유저 목록을 반환합니다.
   */
  @Get()
  @ApiOperation({
    summary: '유저 전체 조회',
    description: '유저 전체 조회',
  })
  @ApiResponse({
    status: 200,
    description: '전체 유저를 성공적으로 조회했습니다.',
    type: [User],
  })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  /**
   * @author SJY0917032
   * @description 유저를 생성합니다.
   *
   * @returns {Promise<User>} 유저를 생성해 리턴합니다.
   */
  @Post()
  @ApiOperation({
    summary: '유저 생성',
    description: '유저를 생성합니다.',
  })
  @ApiCreatedResponse({
    description: '유저 생성 성공',
    type: User,
  })
  @ApiUnprocessableEntityResponse({
    description: '유저 생성 실패',
    status: 422,
  })
  create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  /**
   * @author SJY0917032
   * @description 유저를 수정합니다.
   *
   * @param email 수정할 유저의 이메일
   * @returns {Promise<User>} 유저를 수정해 리턴합니다.
   */
  @Patch(':email')
  @ApiOperation({
    summary: '유저 수정',
    description: '유저를 수정합니다.',
  })
  @ApiCreatedResponse({
    description: '유저 수정 성공',
    type: User,
  })
  @ApiBadRequestResponse({
    description: '유저 존재하지 않음',
    status: 400,
  })
  update(
    @Param('email') email: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(email, updateUserDto);
  }

  /**
   * @author SJY0917032
   * @description 유저를 삭제합니다.
   *
   * @param email 삭제할 유저의 이메일
   * @returns {Promise<boolean>} 유저의 삭제 여부를 리턴합니다.
   */
  @Delete(':email')
  @ApiOperation({
    summary: '유저 삭제',
    description: '유저를 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저 삭제 성공',
    type: Boolean,
  })
  delete(@Param('email') email: string): Promise<boolean> {
    return this.userService.delete(email);
  }
}
