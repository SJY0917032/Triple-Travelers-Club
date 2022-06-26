import {
  Bind,
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { multerDiskOptions } from '../../commons/utils/multer.option';
import { FileService } from './file.service';
import { join } from 'path';

@Controller('uploads')
export class FileController {
  constructor(
    private readonly fileService: FileService, //
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', null, multerDiskOptions))
  @Bind(UploadedFiles())
  uploadFile(files: File[]) {
    return this.fileService.uploadFile(files);
  }

  @Get(':url')
  async getFile(@Param('url') url: string) {
    const PATH = process.cwd() + '/uploads';
    const stream = createReadStream(join(PATH, url));

    return new StreamableFile(stream);
  }
}
