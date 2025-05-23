import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars{
    PORT:number;
}

const envsSchema = joi.object({
    PORT:joi.number().required()
})
.unknown()

const {error, value} = envsSchema.validate(process.env);

if(error) throw new Error(`Config validate error: ${error.message}`);

const envVars: EnvVars = value;


export const envs = {
    port: envVars.PORT,
}
