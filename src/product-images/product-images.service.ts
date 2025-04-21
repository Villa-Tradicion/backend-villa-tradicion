// product-images/product-images.service.ts
import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';

@Injectable()
export class ProductImagesService {
  private readonly logger = new Logger('ProductImagesService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  async addImagesToProduct(productId: number, images: Express.Multer.File[]) {
    try {
      // Verificar que el producto existe
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      
      if (!product) {
        throw new NotFoundException(`Producto con id ${productId} no encontrado`);
      }

      // Verificar límite de imágenes
      const existingImages = await this.prisma.productImage.count({
        where: { productId }
      });
      
      const maxImages = 5;
      if (existingImages + images.length > maxImages) {
        throw new BadRequestException(`No se pueden agregar más de ${maxImages} imágenes por producto.`);
      }

      // Subir las nuevas imágenes
      const imageUrls = await this.filesService.uploadMultipleFiles(images);
      
      // Crear registros para las nuevas imágenes
      const hasMainImage = await this.prisma.productImage.findFirst({
        where: { productId, isMain: true }
      });

      await this.prisma.$transaction(
        imageUrls.map((url, index) => 
          this.prisma.productImage.create({
            data: {
              url,
              isMain: !hasMainImage && index === 0, // Solo la primera es principal si no hay una principal
              productId,
            },
          })
        )
      );

      return this.getProductImages(productId);
      
    } catch (error) {
      this.logger.error(`Error al añadir imágenes: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('No se pudieron añadir las imágenes');
    }
  }

  async removeImage(imageId: number) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      throw new NotFoundException(`Imagen con id ${imageId} no encontrada`);
    }

    try {
      // Eliminar el archivo de S3
      await this.filesService.deleteFile(image.url);
      
      // Eliminar el registro de la base de datos
      await this.prisma.productImage.delete({
        where: { id: imageId }
      });

      // Si era la imagen principal, asignar otra como principal
      if (image.isMain) {
        const anotherImage = await this.prisma.productImage.findFirst({
          where: { productId: image.productId }
        });
        
        if (anotherImage) {
          await this.prisma.productImage.update({
            where: { id: anotherImage.id },
            data: { isMain: true }
          });
        }
      }

      return { message: 'Imagen eliminada correctamente' };
    } catch (error) {
      this.logger.error(`Error al eliminar imagen: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo eliminar la imagen');
    }
  }

  async setMainImage(imageId: number) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      throw new NotFoundException(`Imagen con id ${imageId} no encontrada`);
    }

    try {
      // Quitar estado de principal a todas las imágenes del producto
      await this.prisma.productImage.updateMany({
        where: { productId: image.productId },
        data: { isMain: false }
      });
      
      // Establecer la imagen seleccionada como principal
      await this.prisma.productImage.update({
        where: { id: imageId },
        data: { isMain: true }
      });

      return this.getProductImages(image.productId);
    } catch (error) {
      this.logger.error(`Error al establecer imagen principal: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo establecer la imagen como principal');
    }
  }

  async getProductImages(productId: number) {
    return await this.prisma.productImage.findMany({
      where: { productId }
    });
  }

  async replaceProductImages(productId: number, images: Express.Multer.File[]) {
    try {
      // Verificar que el producto existe
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      
      if (!product) {
        throw new NotFoundException(`Producto con id ${productId} no encontrado`);
      }

      // Obtener imágenes existentes
      const existingImages = await this.prisma.productImage.findMany({
        where: { productId }
      });
      
      // Eliminar todas las imágenes existentes
      if (existingImages.length > 0) {
        // Eliminar físicamente las imágenes de S3
        await Promise.all(
          existingImages.map(img => this.filesService.deleteFile(img.url))
        );
        
        // Eliminar registros de la base de datos
        await this.prisma.productImage.deleteMany({
          where: { productId }
        });
      }
      
      // Si no hay nuevas imágenes, terminar
      if (!images || images.length === 0) {
        return [];
      }

      // Subir nuevas imágenes
      const imageUrls = await this.filesService.uploadMultipleFiles(images);
      
      // Crear registros para las nuevas imágenes
      await this.prisma.$transaction(
        imageUrls.map((url, index) => 
          this.prisma.productImage.create({
            data: {
              url,
              isMain: index === 0, // La primera imagen es principal
              productId,
            },
          })
        )
      );

      return this.getProductImages(productId);
    } catch (error) {
      this.logger.error(`Error al reemplazar imágenes: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('No se pudieron reemplazar las imágenes');
    }
  }
}