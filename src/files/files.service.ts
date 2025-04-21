import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
    private readonly s3Client: S3Clirent;
}
