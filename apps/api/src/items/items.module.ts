import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { UsersModule } from '../users/users.module';
import { ItemRecommendController } from './item-recommend.controller';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { RecommendationsController } from './recommendations.controller';

@Module({
  imports: [AuthModule, CatalogModule, UsersModule],
  controllers: [ItemsController, ItemRecommendController, RecommendationsController],
  providers: [ItemsService],
})
export class ItemsModule {}
