import {
  BadRequestException,
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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('File')
@Controller('uploads')
export class FileController {
  constructor(
    private readonly fileService: FileService, //
  ) {}

  /**
   * @author SJY0917032
   * @description 파일을 업로드합니다.
   *
   * @param files 파일객체
   * @returns {string[]} 업로드된 파일의 주소를 반환합니다.
   */
  @Post()
  @ApiOperation({
    summary: '파일 업로드',
    description: '파일을 업로드합니다',
  })
  @ApiCreatedResponse({
    description: '파일 업로드 성공',
    type: [String],
  })
  @ApiBadRequestResponse({
    description: '파일 업로드 실패',
    schema: {
      example: '파일을 찾을 수 없습니다.',
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', null, multerDiskOptions))
  @Bind(UploadedFiles())
  uploadFile(files: File[]): string[] {
    return this.fileService.uploadFile(files);
  }

  /**
   * @author SJY0917032
   * @description 파일의 URL을 받아 읽기 가능한 파일로 변경해 반환합니다.
   *
   * @param url 파일의 주소
   * @returns {StreamableFile} 파일을 읽기 가능한 상태로 변경해 반환합니다.
   */
  @Get(':url')
  @ApiOperation({
    summary: '파일 확인',
    description: '파일을 확인합니다',
  })
  @ApiParam({ type: String, name: 'url' })
  @ApiResponse({
    status: 200,
    description: '파일 URL로 조회를 성공.',
    type: StreamableFile,
  })
  @ApiBadRequestResponse({
    description: 'URL 조회 실패',
    schema: {
      example: '해당 URL의 파일이 존재하지 않습니다.',
    },
  })
  getFile(@Param('url') url: string): StreamableFile {
    const PATH = process.cwd() + '/uploads';
    const stream = createReadStream(join(PATH, url));

    if (!createReadStream) {
      throw new BadRequestException('해당 파일이 없습니다.');
    }

    return new StreamableFile(stream);
  }
}
