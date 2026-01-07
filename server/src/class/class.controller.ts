import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { UserRole } from '../auth/enums/role.enum';

@Controller('classes')
// @UseGuards(JwtAuthGuard, RolesGuard) // Temporarily commented out for seeding
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  @Get()
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  findAll(
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const sortField = sort || 'createdAt';
    const sortOrder = order || 'DESC';
    const searchTerm = search || '';
    const pageNum = page ? parseInt(page, 10) : 1;
    const perPageNum = perPage ? parseInt(perPage, 10) : 10;
    return this.classService.findAll(sortField, sortOrder, searchTerm, pageNum, perPageNum);
  }

  @Get(':id')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  findOne(@Param('id') id: string) {
    return this.classService.findOne(id);
  }

  @Patch(':id')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(id, updateClassDto);
  }

  @Delete(':id')
  // @Roles(UserRole.ADMIN) // Temporarily commented out for seeding
  remove(@Param('id') id: string) {
    return this.classService.remove(id);
  }

  @Post(':id/students/:studentId')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  addStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.classService.addStudent(id, studentId);
  }

  @Delete(':id/students/:studentId')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.classService.removeStudent(id, studentId);
  }

  @Get('student/:studentId')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Temporarily commented out for seeding
  findByStudent(@Param('studentId') studentId: string) {
    return this.classService.findByStudent(studentId);
  }
} 