import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiModule } from '@api/api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from '@common/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          supportBigNumbers: true,
          bigNumberStrings: false,
          type: 'postgres',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          database: configService.get('database.name'),
          username: configService.get('database.user'),
          password: configService.get('database.password'),
          entities: [join(__dirname, '/common/entities/*.entity.{ts,js}')],
          synchronize: false,
          timezone: 'Z',
          logging: false,
          // logging: false,
        };
      },
    }),
    ApiModule,
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {}
  configure(_consumer: MiddlewareConsumer) {}
}
