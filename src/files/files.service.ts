import { Injectable, Logger } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { envs } from 'src/config/envs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FilesService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(FilesService.name);

  constructor() {
    this.s3Client = new S3Client({
      region: envs.awsRegion,
      credentials: {
        accessKeyId: envs.awsAccessKeyId,
        secretAccessKey: envs.awsSecretAccessKey,
      },
    });
    this.bucketName = envs.awsBucketName;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = `media-villa-tradicion`,
  ): Promise<string> {
    try {
      const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Construir la URL para acceder al archivo
      const fileUrl = `https://${this.bucketName}.s3.${envs.awsRegion}.amazonaws.com/${fileName}`;
      return fileUrl;

    } catch (error) {
      this.logger.error(
        `Error al subir archivo a S3: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extraer el key del archivo desde la URL
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // Elimina el primer '/'
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Error al eliminar archivo de S3: ${error.message}`, error.stack);
      throw error;
    }
  }

  async generatePresignedUrl(key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
