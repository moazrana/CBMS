import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    let response = await this.authService.login(loginDto);
    console.log(response);
    return response;
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validateToken(@Request() req) {
    // Get fresh user data with role and permissions
    const user = await this.usersService.findOneForLogin(req.user._id);
    
    return {
      valid: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role.name,
        name: user.name
      },
      permissions: user.role.permissions.map((permission: any) => permission.name),
      message: 'Token is valid'
    };
  }
} 