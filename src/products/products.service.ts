import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { CategoryService } from 'src/category/category.service';
@Injectable()
export class ProductsService extends PrismaClient {
  private readonly logger = new Logger('ProductService');

  // constructor(
  //   private readonly categoriesService: CategoryService,
  // ) {}

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database Connected');
  }

  async create(createProductDto: CreateProductDto) {
    try {
      // const category = await this.categoryService.findOne(
      //   createProductDto.categoryId,
      // );

      return this.product.create({
        data: createProductDto,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async findAll() {
    return await this.product.findMany({
      where: { available: true },
      include: {
        category: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
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

    return this.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
    // console.log('Soft deleted product:', product);
    return product;
  }
}
