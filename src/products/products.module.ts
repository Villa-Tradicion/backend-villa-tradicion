import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoryModule } from 'src/category/category.module';
import { AuthModule } from 'src/auth/auth.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[CategoryModule,AuthModule, FilesModule]
})
export class ProductsModule {}
