import { Module } from '@nestjs/common';
import { StorageModule } from '../../storage/storage.module';
import { RecruitmentModule } from '../../recruitment/recruitment.module';
import { AdminRecruitmentController } from './admin-recruitment.controller';
import { AdminRecruitmentService } from './admin-recruitment.service';
import { BrevoMailModule } from '../../mail/mail-brevo.module';

@Module({
  // Vacancy/Application repositories come from the non-admin module so both
  // sides share one query surface per entity.
  imports: [RecruitmentModule, StorageModule, BrevoMailModule],
  controllers: [AdminRecruitmentController],
  providers: [AdminRecruitmentService],
  exports: [AdminRecruitmentService],
})
export class AdminRecruitmentModule {}
