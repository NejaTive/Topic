import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ShareController } from './share.controller';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

@Module({
  imports: [AuthModule],
  controllers: [TopicsController, ShareController],
  providers: [TopicsService],
})
export class TopicsModule {}
