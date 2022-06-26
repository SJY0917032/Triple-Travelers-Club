import { Injectable } from '@nestjs/common';
import { uploadFileURL } from '../../commons/utils/multer.option';

@Injectable()
export class FileService {
  uploadFile(files: File[]): any {
    return files.map((file: any) => {
      return uploadFileURL(file.filename);
    });
  }
}
