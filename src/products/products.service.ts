import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from 'src/category/category.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilesService } from 'src/files/files.service';
@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    private readonly categoriesService: CategoryService,
    private readonly prisma: PrismaService,
    private fileService: FilesService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    images?: Express.Multer.File[],
  ) {
    try {
      await this.categoriesService.findOne(createProductDto.categoryId);

      // Crear el producto primero sin imágenes
      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
        },
      });

      // Si hay imágenes, subirlas y vincularlas al producto
      if (images && images.length > 0) {
        const imageUrls = await this.fileService.uploadMultipleFiles(images);
        
        // Crear registros de imágenes para el producto
        await this.prisma.$transaction(
          imageUrls.map((url, index) => 
            this.prisma.productImage.create({
              data: {
                url,
                isMain: index === 0, // La primera imagen es la principal
                productId: product.id,
              },
            })
          )
        );
      }

      return this.prisma.product.findUnique({
        where: { id: product.id },
        include: { images: true },
      });

    } catch (error) {
      this.logger.error('Error al crear producto', error.stack);
      // Si es una excepción esperada (como NotFound), la relanzamos
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Si es otro error interno, lanzamos una excepción genérica
      throw new InternalServerErrorException('No se pudo crear el producto');
    }
  }

  async findAll() {
    return await this.prisma.product.findMany({
      where: { available: true },
      include: {
        category: true,
        images:true
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, available: true },
      include: {
        category: true,
        images:true
      },
    });

    if (!product)
      throw new NotFoundException(`Producto con id: ${id} no fue encontrado`);

    return product;
  }

  async update(
    id: number,
    data: UpdateProductDto,
    images?: Express.Multer.File[],
  ) {
    const product = await this.findOne(id);
  
    try {
      // 1. Actualizar la información básica del producto
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          ...data,
        },
      });
  
      // 2. Procesar las imágenes si se proporcionan
      if (images && images.length > 0) {
        // Subir las nuevas imágenes
        const imageUrls = await this.fileService.uploadMultipleFiles(images);
        
        // Determinar comportamiento de las imágenes
        const existingImages = await this.prisma.productImage.findMany({
          where: { productId: id }
        });
        
        // Si ya hay imágenes existentes y hay nuevas imágenes
        if (existingImages.length > 0) {
          // Opción 1: Eliminar todas las imágenes existentes y crear nuevas
          // Eliminar físicamente las imágenes de S3
          await Promise.all(
            existingImages.map(img => this.fileService.deleteFile(img.url))
          );
          
          // Eliminar registros de la base de datos
          await this.prisma.productImage.deleteMany({
            where: { productId: id }
          });
        }
        
        // Crear registros para las nuevas imágenes
        await this.prisma.$transaction(
          imageUrls.map((url, index) => 
            this.prisma.productImage.create({
              data: {
                url,
                isMain: index === 0, // La primera imagen es la principal
                productId: id,
              },
            })
          )
        );
      }
  
      // Retornar el producto actualizado con sus imágenes
      return this.prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });
    } catch (error) {
      this.logger.error(
        `Error al actualizar producto: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'No se pudo actualizar el producto',
      );
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
    // console.log('Soft deleted product:', product);
    return product;
  }
}
