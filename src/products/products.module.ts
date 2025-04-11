import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoryModule } from 'src/category/category.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[CategoryModule]
})
export class ProductsModule {}
