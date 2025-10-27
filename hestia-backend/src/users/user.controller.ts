import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UsersService } from './user.service';
import { User } from './entities/user.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Protege este endpoint si quieres que solo usuarios autenticados accedan a la lista de usuarios
  @UseGuards(FirebaseAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: [User],
  })
  getUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUser(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // Opcional: permite solo acceder al propio perfil o chequear permisos.
    if (req.user.uid !== id.toString()) {
      throw new UnauthorizedException('No tienes acceso a este recurso');
    }
    return this.usersService.getUserById(id);
  }

  // Endpoint para crear usuario no protegido (depende de tu modelo de negocio)
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  // Los restantes endpoints deberían protegerse para evitar cambios sin autenticación
  @UseGuards(FirebaseAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req) {
    if (req.user.uid !== id.toString()) {
      throw new UnauthorizedException('No tienes permiso para eliminar este usuario');
    }
    return this.usersService.delete(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateUserDto,
    @Req() req,
  ) {
    if (req.user.uid !== id.toString()) {
      throw new UnauthorizedException('No tienes permiso para modificar este usuario');
    }
    return this.usersService.update(id, changes);
  }


  @UseGuards(FirebaseAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user; // retorna info del usuario autenticado
  }
}
