import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [ProductsModule, CategoryModule, PrismaModule, AuthModule,CloudinaryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
