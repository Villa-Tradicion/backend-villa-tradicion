// product-images/product-images.controller.ts
import { Controller, Post, Delete, Patch, Param, UseInterceptors, UploadedFiles, UseGuards, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { ValidRoles } from '../auth/interfaces';
import { ProductImagesService } from './product-images.service';
import { memoryStorage } from '../common/multer/multer-config';

@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post('product/:productId')
  @UseInterceptors(FilesInterceptor('images', 5, memoryStorage))
  @RoleProtected(ValidRoles.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  addImages(
    @Param('productId') productId: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('Se requiere al menos una imagen');
    }
    return this.productImagesService.addImagesToProduct(+productId, images);
  }

  @Delete(':imageId')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  removeImage(@Param('imageId') imageId: string) {
    return this.productImagesService.removeImage(+imageId);
  }

  @Patch(':imageId/set-main')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  setMainImage(@Param('imageId') imageId: string) {
    return this.productImagesService.setMainImage(+imageId);
  }
}