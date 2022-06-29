import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response as ExpressResponse } from 'express';
import { ApiExcludeController, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiExcludeEndpoint()
  sendSwaggerDocs(@Res() res: ExpressResponse): void {
    this.appService.sendSwaggerDocs(res);
  }
}
