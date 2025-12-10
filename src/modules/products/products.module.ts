import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ModelsService } from 'src/common/models/models.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ModelsService],
})
export class ProductsModule {}
