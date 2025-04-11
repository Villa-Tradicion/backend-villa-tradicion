import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Villa&Tradicion');

  app.setGlobalPrefix('api');

  app.useGlobalPipes( 
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }) 
   )
  app.enableCors();
  await app.listen(envs.port);
  logger.log(`Running on port ${envs.port}`)
}
bootstrap();
