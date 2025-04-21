import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ValidRoles } from 'src/auth/interfaces';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guard';
import { RoleProtected } from 'src/auth/decorators/role-protected.decorator';
import { UseGuards } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'src/common/multer/multer-config';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', undefined, memoryStorage))
  @RoleProtected(ValidRoles.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    //Validamos el maximo de imagenes que se pueden subir por producto
    const max = 5;
    if (images.length > max) {
      throw new BadRequestException(`Solo se permiten máximo ${max} imágenes.`);
    }
    return this.productsService.create(createProductDto, images);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 5, memoryStorage))
  @RoleProtected(ValidRoles.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.productsService.update(+id, updateProductDto, images);
  }

  @Delete(':id')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
