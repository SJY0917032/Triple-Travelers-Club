import { HttpException, ExceptionFilter, Catch } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    const status = exception.getStatus();
    const message = exception.message;
    const eDate = new Date();
    const returnDate = `${eDate.getFullYear()}-${
      eDate.getMonth() + 1
    }-${eDate.getDate()}`;
    const returnTime = `${eDate.getHours()}:${eDate.getMinutes()}:${eDate.getSeconds()}`;

    console.log('🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧');
    console.log(
      `🚀${message}가 발생했습니다. 코드는 ${status} 발생일자 : ${returnDate} 발생시간 : ${returnTime}`,
    );
    console.log('🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧🚧');
  }
}
