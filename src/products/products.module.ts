import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoryService } from 'src/category/category.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[CategoryService]
})
export class ProductsModule {}
