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
    
    // Get user with populated role and permissions
    const userWithRoleAndPermissions = await this.usersService.findOneForLogin(user._id.toString());
    console.log(userWithRoleAndPermissions.role);
    
    const payload = { 
      email: userWithRoleAndPermissions.email, 
      sub: userWithRoleAndPermissions._id, 
      role: userWithRoleAndPermissions.role.name
    };
    console.log('logging in....');
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userWithRoleAndPermissions._id,
        name: userWithRoleAndPermissions.name,
        email: userWithRoleAndPermissions.email,
        role: userWithRoleAndPermissions.role.name,
        permissions: userWithRoleAndPermissions.role.permissions
      },
    };
  }
} 