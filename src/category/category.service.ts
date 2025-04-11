import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma-service/prisma-service.service';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger('ProductService');

  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Validamos si ya existe una categoría con ese nombre
    await this.validateCategoryNameUnique(createCategoryDto);
    try {
      return this.prisma.category.create({
        data: createCategoryDto,
      });
    } catch (error: any) {
      this.logger.error('Error al crear la categoria', error.stack);
      // Si es otro error interno, lanzamos una excepción genérica
      throw new InternalServerErrorException('No se pudo crear la categoria');
    }
  }

  private async validateCategoryNameUnique(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findFirst({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException(
        `La categoría "${createCategoryDto.name}" ya existe. Por favor asigna otro nombre.`
      );
    }
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
      where: { id },
    });

    if (!category)
      throw new NotFoundException(`Categoria con id: ${id} no fue encontrado`);

    return category;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
