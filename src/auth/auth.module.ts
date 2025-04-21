import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard, RolesGuard } from './guard';
@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  imports:[
    PassportModule.register({ defaultStrategy:'jwt' }),
    JwtModule.register({
      global:true,
      secret: envs.jwtSecret,
      signOptions: {expiresIn:'3h'}
    }),
  ],
  exports:[
    JwtAuthGuard, 
    RolesGuard
  ]
})
export class AuthModule {}
