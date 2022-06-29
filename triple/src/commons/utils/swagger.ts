import { INestApplication } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';

const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};

/**
 *
 * @description Swagger Setting File
 *
 */
export function setUpSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('트리플-여행자클럽-마일리지-서비스')
    .setDescription('트리플 여행자클럽 마일리지 서비스의 API입니다.')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document, swaggerCustomOptions);
}
