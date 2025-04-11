import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CategoryService extends PrismaClient{
  private readonly logger = new Logger('ProductService')
  
  
  async onModuleInit(){
    await this.$connect();
    this.logger.log('Database Connected')
  }
  
  create(createCategoryDto: CreateCategoryDto) {
    return this.category.create({
      data: createCategoryDto
    })
  }

  async findAll() {
    return await this.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findOne(id: number) {
    const category = await this.category.findFirst({
      where: {id}
    });

    if(!category) throw new NotFoundException(`Categoria ${category.name} con id: ${id} no fue encontrado`);
    
    return category
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
