import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  PaginationDto,
  GetUnilevelTreeDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

@ApiTags('Autenticación')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    operationId: 'register',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '1',
          name: 'John Doe',
          phone: '+573001234567',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'El usuario ya existe',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+573001234567',
          identification: '1234567890',
          address: 'Calle 123 #45-67',
          city: 'Bogotá',
          state: 'Cundinamarca',
          zipCode: '110111',
          imageProfileUrl: 'https://example.com/profile.jpg',
          birtDate: '1990-01-15T00:00:00.000Z',
          father: null,
          side: 1,
          status: true,
          termsConditions: true,
          role: {
            id: 1,
            name: 'Admin',
          },
          country: {
            id: 1,
            name: 'Colombia',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
    schema: {
      example: {
        id: '1',
        name: 'John Doe',
        phone: '+573001234567',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  getProfile(@GetUser() user: { id: string; name: string; phone: string }) {
    return user;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los usuarios con paginación' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de registros por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    schema: {
      example: {
        data: [
          {
            id: 1,
            name: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+573001234567',
            identification: '1234567890',
            address: 'Calle 123 #45-67',
            city: 'Bogotá',
            state: 'Cundinamarca',
            zipCode: '110111',
            imageProfileUrl: 'https://example.com/profile.jpg',
            birtDate: '1990-01-15T00:00:00.000Z',
            father: null,
            createdAt: '2025-11-11T00:00:00.000Z',
            updatedAt: '2025-11-11T00:00:00.000Z',
            role: {
              id: 1,
              name: 'Admin',
            },
          },
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.authService.findAll(paginationDto);
  }

  @Get('get_user_phone/:phone')
  @ApiOperation({ summary: 'Buscar usuario por número de teléfono' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado exitosamente',
    schema: {
      example: {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        phone: '+573001234567',
        city: 'Bogotá',
        state: 'Cundinamarca',
        imageProfileUrl: 'https://example.com/profile.jpg',
        role: {
          id: 1,
          name: 'Admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  findByPhone(@Param('phone') phone: string) {
    return this.authService.findByPhone(phone);
  }

  @Get('unilevel-tree')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener árbol unilevel del usuario',
    description:
      'Obtiene el árbol genealógico unilevel del usuario. Los usuarios regulares solo pueden ver su propio árbol, mientras que los administradores pueden especificar un userId para ver cualquier árbol.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'ID del usuario raíz del árbol (solo para administradores)',
    example: 1,
  })
  @ApiQuery({
    name: 'maxLevel',
    required: false,
    type: Number,
    description: 'Nivel máximo de profundidad del árbol (1-20)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Árbol unilevel obtenido exitosamente',
    schema: {
      example: {
        tree: [
          {
            id: 1,
            phone: '573001234567',
            email: 'john@example.com',
            level: 0,
            father: null,
            imageProfileUrl: 'https://example.com/profile.jpg',
          },
          {
            id: 2,
            phone: '573001234568',
            email: 'jane@example.com',
            level: 1,
            father: 1,
            imageProfileUrl: 'https://example.com/profile2.jpg',
          },
        ],
        totalNodes: 2,
        maxLevel: 1,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  getUnilevelTree(
    @GetUser() user: { id: string; phone: string },
    @Query() unilevelTreeDto: GetUnilevelTreeDto,
  ) {
    return this.authService.getUnilevelTree(user, unilevelTreeDto);
  }
}
