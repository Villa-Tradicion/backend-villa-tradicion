import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma-service/prisma-service.service';

@Injectable()
export class CategoryService{
  private readonly logger = new Logger('ProductService')
  
  constructor(private readonly prisma:PrismaService){}
 
  
  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto
    })
  }

  async findAll() {
    return await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findFirst({
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
