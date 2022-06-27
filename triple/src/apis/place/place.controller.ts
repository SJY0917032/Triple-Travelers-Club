import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/createPlaceDto';

@Controller('place')
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService, //
  ) {}

  @Get()
  findAll() {
    return this.placeService.findAll();
  }

  @Get(':name')
  findByName(
    @Param('name') name: string, //
  ) {
    return this.placeService.findByName(name);
  }

  @Post()
  create(@Body(ValidationPipe) createPlaceDto: CreatePlaceDto) {
    return this.placeService.create(createPlaceDto);
  }
}
