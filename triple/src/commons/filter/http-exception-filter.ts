import {
  HttpException,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const log = {
      timestamp: new Date().toISOString(),
      url: req.url,
      res,
    };

    const response = exception.getResponse();

    const status = exception.getStatus();

    console.log(`${log.timestamp} ${log.url} ${status} ${exception.message}`);

    res.status(exception.getStatus()).json(response);
  }
}
