import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
