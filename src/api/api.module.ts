import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  JwtAdminAccessStrategy,
  JwtAdminRefreshStrategy,
  JwtGatewayAccessStrategy,
  JwtGatewayRefreshStrategy,
  LocalAdminStrategy,
} from '@api/auth/strategies';
import { HealthModule } from './health/health.module';
import cookieParser from 'cookie-parser';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
@Module({
  imports: [
    AuthModule,
    AdminModule,
    HealthModule,
    RouterModule.register([
      {
        path: 'api',
        module: HealthModule,
        children: [AuthModule, AdminModule],
      },
    ]),
  ],
  controllers: [],
  providers: [
    AuthModule,
    AdminModule,
    HealthModule,
    JwtAdminAccessStrategy,
    JwtAdminRefreshStrategy,
    JwtGatewayAccessStrategy,
    JwtGatewayRefreshStrategy,
    LocalAdminStrategy,
  ],
})
export class ApiModule implements NestModule {
  constructor() {}
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(cookieParser()).forRoutes('*');
    // consumer.apply(LoggerMiddleware).forRoutes('*'); //middleware들은 consumer에다가 연결한다!
  }
}
