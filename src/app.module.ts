import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostgreSQLModule } from './databases/postgresql.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { RedisModule } from './redis/redis.module';
import { EventsModule } from './events/events.module';
import { BoardModule } from './board/board.module';
import { CategoriesModule } from './categories/categories.module';
import { CommitteesModule } from './committees/committees.module';
import { AwardsModule } from './awards/awards.module';
import { AdminModule } from './admin/admin.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PhoneNumberInterceptor } from './interceptor/phone-number.interceptor';
import { MediaModule } from './media/media.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { StorageModule } from './storage/storage.module';
import { RecruitmentModule } from './recruitment/recruitment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/.env',
    }),
    PostgreSQLModule,
    AuthModule,
    UsersModule,
    RolesModule,
    RedisModule,
    EventsModule,
    BoardModule,
    CategoriesModule,
    CommitteesModule,
    AwardsModule,
    MediaModule,
    AdminModule,
    StorageModule,
    RecruitmentModule,
    WorkshopsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PhoneNumberInterceptor,
    },
  ],
})
export class AppModule {}
