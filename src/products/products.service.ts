import {
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
    image?: Express.Multer.File,
  ) {
    const product = await this.findOne(id);

    try {
      let imageUrl = product.imageUrl;

      // Si hay una nueva imagen, eliminar la anterior y subir la nueva
      if (image) {
        if (product.imageUrl) {
          await this.fileService.deleteFile(product.imageUrl);
        }
        imageUrl = await this.fileService.uploadFile(image);
      }

      return this.prisma.product.update({
        where: { id },
        data: {
          ...data,
          imageUrl,
        },
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
