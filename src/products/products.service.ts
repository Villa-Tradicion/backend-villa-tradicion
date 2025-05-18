// products/products.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from '../category/category.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    private readonly categoriesService: CategoryService,
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    files?: Express.Multer.File[],
  ) {
    try {
      await this.categoriesService.findOne(createProductDto.categoryId);

      // Crear el producto sin imágenes
      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
        },
      });

      // Si hay imágenes, usar el servicio especializado para añadirlas
      if (files && files.length > 0) {
        await this.cloudinaryService.addMediaToProduct(product.id, files);
      }

      return this.findOne(product.id);
      
    } catch (error) {
      this.logger.error('Error al crear producto', error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('No se pudo crear el producto');
    }
  }

  async findAll() {
    return await this.prisma.product.findMany({
      where: { available: true },
      include: {
        category: true,
        files: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, available: true },
      include: {
        category: true,
        files: true,
      },
    });

    if (!product)
      throw new NotFoundException(`Producto con id: ${id} no fue encontrado`);

    return product;
  }

  async update(
    id: number,
    data: UpdateProductDto,
    files?: Express.Multer.File[],
  ) {
    // Verificar que el producto existe
    await this.findOne(id);

    try {
      // Actualizar datos básicos del producto
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data,
      });

      // Si se proporcionaron imágenes, reemplazar las existentes
      if (files && files.length > 0) {
        await this.cloudinaryService.replaceProductMedia(id, files);
      }

      return this.findOne(id);
      
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
    return product;
  }
}
