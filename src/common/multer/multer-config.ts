// Corrige esta importación si es necesario
import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';

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