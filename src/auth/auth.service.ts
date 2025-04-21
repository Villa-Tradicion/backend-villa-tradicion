import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async singJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token);

      return {
        user: user,
        token: await this.singJWT(user as JwtPayload),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password, phone } = registerUserDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        throw new UnauthorizedException('User already exists');
      }

      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: bcrypt.hashSync(password, 10),
          name,
          phone,
          role: 'customer', // Default role
        },
      });

      const { password: _, ...rest } = newUser;

      const payload: JwtPayload = {
        id: rest.id,
        email: rest.email,
        name: rest.name,
        phone: rest.phone || '',
      };

      return {
        user: rest,
        token: await this.singJWT(payload),
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('User/password not valid');
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('User/password not valid');
      }

      const { password: _, ...rest } = user;

      const payload: JwtPayload = {
        id: rest.id,
        email: rest.email,
        name: rest.name,
        phone: rest.phone || '',
      };

      return {
        user: rest,
        token: await this.singJWT(payload),
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
