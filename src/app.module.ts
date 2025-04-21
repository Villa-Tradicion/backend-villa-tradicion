import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [ProductsModule, CategoryModule, PrismaModule, AuthModule, FilesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
