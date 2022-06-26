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

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService, //
  ) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Post()
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':email')
  update(
    @Param('email') email: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(email, updateUserDto);
  }

  @Delete(':email')
  delete(@Param('email') email: string) {
    return this.userService.delete(email);
  }
}
