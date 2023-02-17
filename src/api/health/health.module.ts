import { Module } from '@nestjs/common';
import { HealthController } from '@api/health/health.controller';
@Module({
  imports: [],
  providers: [],
  controllers: [HealthController],
  exports: [],
})
export class HealthModule {}
