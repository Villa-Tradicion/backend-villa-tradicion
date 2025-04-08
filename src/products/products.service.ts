import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
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
    return await this.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {id, available:true}
    });

    if(!product) throw new HttpException('Producto no encontrado', HttpStatus.BAD_REQUEST);

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
