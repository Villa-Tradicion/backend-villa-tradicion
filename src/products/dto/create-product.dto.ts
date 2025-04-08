import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres.' })
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  widthCm?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  depthCm?: number;

  @IsArray()
  @IsString({ each: true })
  materials: string[];

  @IsArray()
  @IsString({ each: true })
  availableColors: string[];

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsString()
  categoryId: string;
}
