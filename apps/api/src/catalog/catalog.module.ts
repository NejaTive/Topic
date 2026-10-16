import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { TmdbClient } from './tmdb.client';

@Module({
  imports: [AuthModule],
  controllers: [CatalogController],
  providers: [TmdbClient, CatalogService],
  exports: [TmdbClient],
})
export class CatalogModule {}
