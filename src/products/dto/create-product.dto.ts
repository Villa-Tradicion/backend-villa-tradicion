import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  public name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres.' })
  public description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public price: number;

  @IsOptional()
  @IsBoolean()
  public available?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public widthCm?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public depthCm?: number;

  @IsArray()
  @IsString({ each: true })
  public materials: string[];

  @IsArray()
  @IsString({ each: true })
  public availableColors: string[];

  @IsNumber()
  @Type(() => Number)
  public categoryId: number;
}
