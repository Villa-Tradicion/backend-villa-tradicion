import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { PrismaServiceModule } from './prisma-service/prisma-service.module';

@Module({
  imports: [ProductsModule, CategoryModule, PrismaServiceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
