import { Injectable } from '@nestjs/common';
import { uploadFileURL } from '../../commons/utils/multer.option';

@Injectable()
export class FileService {
  /**
   * @author SJY0917032
   * @description 파일을 업로드합니다.
   *
   * @param files 파일객체
   * @returns {string[]} 업로드된 파일의 주소를 반환합니다.
   */
  uploadFile(files: File[]): any {
    return files.map((file: any) => {
      return uploadFileURL(file.filename);
    });
  }
}
