// src/storage/cloudinary/cloudinary-storage.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { envs } from 'src/config/envs';
import { PrismaService } from 'src/prisma/prisma.service';

cloudinary.config({
  cloud_name: envs.cloudinary.cloudName,
  api_key: envs.cloudinary.apiKey,
  api_secret: envs.cloudinary.apiSecret,
});

@Injectable()
export class CloudinaryService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('No se recibió respuesta de Cloudinary'));
          resolve(result);
        },
      );
      stream.end(file.buffer);
    });
  }

  async addMediaToProduct(
    productId: number,
    files: Express.Multer.File[],
  ) {
    for (const [idx, file] of files.entries()) {
      const res = await this.uploadFile(file, `products/${productId}`);
      await this.prisma.productMedia.create({
        data: {
          url:       res.secure_url,
          publicId:  res.public_id,
          isMain:    idx === 0,
          mediaType: file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          productId,
        },
      });
    }
  }

  async replaceProductMedia(
    productId: number, 
    files: Express.Multer.File[]
  ) {
    // 1. Busca y elimina assets antiguos en Cloudinary
    const medias = await this.prisma.productMedia.findMany({ where: { productId } });
    for (const m of medias) {
      await cloudinary.uploader.destroy(m.publicId, { resource_type: 'auto' });
    }
    // 2. Borra los registros en DB
    await this.prisma.productMedia.deleteMany({ where: { productId } });
    // 3. Sube los nuevos
    await this.addMediaToProduct(productId, files);
  }
}
