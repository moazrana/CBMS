import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
// import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './schemas/role.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/role.schema';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() data: any): Promise<boolean> {
    console.log('Received role data:', data);
    return !!(await this.rolesService.create(data));
  }

  @Get()
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Role> {
    return this.rolesService.findOne(id);
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<Role> {
    return this.rolesService.findByName(name);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: any,
  ): Promise<boolean> {
    try {
      const updatedRole = await this.rolesService.update(id, updateRoleDto);
      return !!updatedRole;
    } catch (error) {
      return false;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Role> {
    return this.rolesService.remove(id);
  }
} 