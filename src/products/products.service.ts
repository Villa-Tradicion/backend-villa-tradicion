import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class ProductsService extends PrismaClient{
  private readonly logger = new Logger('ProductService')
  
  async onModuleInit(){
    await this.$connect();
    this.logger.log('Database Connected')
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll() {
    return await this.product.findMany({
      where: {available:true}
    });
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {id, available:true}
    });

    if(!product) throw new NotFoundException(`Producto con id: ${id} no fue encontrado`);

    return product;
  }

  async update(id: number, data: UpdateProductDto) {
    
    await this.findOne(id)
    
    return this.product.update({
      where:{id},
      data
    })
  }

  async remove(id: number) {
    await this.findOne(id)
    
    const product = await this.product.update({
      where: {id},
      data: {
        available: false
      }
    });
    console.log('Soft deleted product:', product);
    return product
  }
}
