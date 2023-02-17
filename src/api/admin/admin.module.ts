import { Module } from '@nestjs/common';
import { AdminService } from '@api/admin/admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
