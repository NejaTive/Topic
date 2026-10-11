import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './config/env.validation';
import { FeedModule } from './feed/feed.module';
import { HealthModule } from './health/health.module';
import { ItemsModule } from './items/items.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { TopicsModule } from './topics/topics.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    StorageModule,
    HealthModule,
    AuthModule,
    TopicsModule,
    ItemsModule,
    FeedModule,
    UsersModule,
  ],
})
export class AppModule {}
