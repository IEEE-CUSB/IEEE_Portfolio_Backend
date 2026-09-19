import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { VacanciesRepository } from './vacancies.repository';
import { ApplicationsRepository } from './applications.repository';
import { Vacancy } from './entities/vacancy.entity';
import { VacancyQuestion } from './entities/vacancy-question.entity';
import { Application } from './entities/application.entity';
import { CompleteProfileMiddleware } from '../middleware/complete-profile.middleware';
import { JwtAuthMiddleware } from '../middleware/jwt-auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vacancy, VacancyQuestion, Application]),
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_TOKEN_SECRET,
    }),
    UsersModule,
    StorageModule,
  ],
  controllers: [RecruitmentController],
  providers: [
    RecruitmentService,
    VacanciesRepository,
    ApplicationsRepository,
    JwtStrategy,
    JwtAuthMiddleware,
  ],
  exports: [RecruitmentService, VacanciesRepository, ApplicationsRepository],
})
export class RecruitmentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthMiddleware)
      .forRoutes(
        { path: 'recruitment/vacancies/:id/apply', method: RequestMethod.POST },
        { path: 'recruitment/my-applications', method: RequestMethod.GET },
        { path: 'recruitment/applications/:id', method: RequestMethod.DELETE },
      )
      .apply(CompleteProfileMiddleware)
      .forRoutes({
        path: 'recruitment/vacancies/:id/apply',
        method: RequestMethod.POST,
      });
  }
}
