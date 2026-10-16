import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  imports: [AuthModule, CatalogModule],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
