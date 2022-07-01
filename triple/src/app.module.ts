import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

//Modules
import { UserModule } from './apis/user/user.module';
import { PlaceModule } from './apis/place/place.module';
import { ReviewModule } from './apis/review/review.module';
import { FileModule } from './apis/file/file.module';
import { PointModule } from './apis/point/point.module';
import { EventModule } from './apis/event/event.module';

@Module({
  imports: [
    UserModule,
    PlaceModule,
    ReviewModule,
    PointModule,
    EventModule,
    FileModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'triple-dbserver',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'triple',
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true, // 로그를 남긴다 (명령어가 어떻게 바뀌는지)
      retryAttempts: 30,
      retryDelay: 5000,
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        new DailyRotateFile({
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.printf(
              (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
            ),
          ),
          filename: 'responder-logs/%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
