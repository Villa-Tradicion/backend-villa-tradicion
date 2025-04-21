import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoryModule } from 'src/category/category.module';
import { AuthModule } from 'src/auth/auth.module';
import { ProductImagesModule } from 'src/product-images/product-images.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[CategoryModule,AuthModule, ProductImagesModule]
})
export class ProductsModule {}
