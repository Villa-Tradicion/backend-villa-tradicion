import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from 'src/category/category.service';
import { PrismaService } from 'src/prisma-service/prisma-service.service';
@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    private readonly categoriesService: CategoryService,
    private readonly prisma: PrismaService
  ) {}


  async create(createProductDto: CreateProductDto) {
    try {

      await this.categoriesService.findOne(createProductDto.categoryId);

      return this.prisma.product.create({
        data: createProductDto,
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
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, available: true },
      include: {
        category: true,
      },
    });

    if (!product)
      throw new NotFoundException(`Producto con id: ${id} no fue encontrado`);

    return product;
  }

  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data,
    });
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
