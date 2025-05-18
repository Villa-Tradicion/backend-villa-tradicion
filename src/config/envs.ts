import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;

  JWT_SECRET: string;

  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),

    JWT_SECRET: joi.string().required(),

    CLOUDINARY_CLOUD_NAME: joi.string().required(),
    CLOUDINARY_API_KEY: joi.string().required(),
    CLOUDINARY_API_SECRET: joi.string().required(),
  })
  .unknown();

const { error, value } = envsSchema.validate(process.env);

if (error) throw new Error(`Config validate error: ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,

  jwtSecret: envVars.JWT_SECRET,

  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
};
