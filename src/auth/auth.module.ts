import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { RedisModule } from 'src/redis/redis.module';
import { RolesModule } from 'src/roles/roles.module';
// import { GoogleStrategy } from './strategies/google.strategy';
// import { GithubStrategy } from './strategies/github.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { BrevoMailModule } from '../mail/mail-brevo.module';
import { StorageModule } from 'src/storage/storage.module';
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_TOKEN_SECRET');
        if (!secret) {
          throw new Error('JWT_TOKEN_SECRET is not set');
        }
        const expiresInEnv = config.get<string>(
          'JWT_TOKEN_EXPIRATION_TIME',
          '1h',
        );
        const expiresIn = /^\d+$/.test(expiresInEnv)
          ? Number(expiresInEnv)
          : (expiresInEnv as StringValue);
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    RedisModule,
    RolesModule,
    BrevoMailModule,
    StorageModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
