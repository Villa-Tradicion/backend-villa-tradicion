// src/common/multer/multer-config.ts
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { HttpException, HttpStatus } from '@nestjs/common';
import multer from 'multer';

// Para manejar los archivos en memoria en lugar de guardarlos en disco
export const memoryStorage: MulterOptions = {
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return callback(
        new HttpException(
          'Solo se permiten archivos de imagen (jpg, jpeg, png, webp)',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max por archivo
  },
};