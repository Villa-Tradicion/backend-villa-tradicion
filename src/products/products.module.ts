import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoryModule } from 'src/category/category.module';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';


@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[CategoryModule,AuthModule,CloudinaryModule]
})
export class ProductsModule {}
