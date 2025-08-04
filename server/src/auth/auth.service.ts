import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPinValid=await bcrypt.compare(loginDto.pin,user.pin)
    if(!isPinValid){
      throw new UnauthorizedException('Invalid credentials')
    }
    // Ensure we have the populated role
    
    const userWithRole = await this.usersService.findOne(user._id.toString());
    console.log(userWithRole.role);
    const payload = { 
      email: userWithRole.email, 
      sub: userWithRole._id, 
      role: userWithRole.role.name
    };
    console.log('logging in....');
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userWithRole._id,
        name: userWithRole.name,
        email: userWithRole.email,
        role: userWithRole.role.name
      },
    };
  }
} 