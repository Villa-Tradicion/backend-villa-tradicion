import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma-service/prisma-service.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ProductsModule, CategoryModule, PrismaModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
