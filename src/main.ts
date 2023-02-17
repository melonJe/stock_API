import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origin = (process.env.ALLOW_ORIGINS ?? '').split(',');
  if (process.env.NODE_ENV !== 'production') {
    origin.push(
      ...['http://localhost', 'http://localhost:8000', 'http://localhost:8080'],
    );
  }

  app.enableCors({
    origin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ stopAtFirstError: true, strictGroups: false }),
  );
  // 비밀번호같은 @Exclude() 녀석들은 제거해줌
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const docConfig = new DocumentBuilder()
    .setTitle('BOCOS API Docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api/doc', app, document);

  await app.listen(app.get(ConfigService).get('server.port') ?? 3000);
}
bootstrap();
