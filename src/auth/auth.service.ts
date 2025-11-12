import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, PaginationDto } from './dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { BrevoService } from '../email/brevo.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly brevoService: BrevoService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const {
      name,
      lastName,
      email,
      phone,
      password,
      identification,
      address,
      city,
      state,
      zipCode,
      imageProfileUrl,
      birtDate,
      father,
      roleId,
    } = registerDto;

    // Verificar si el usuario ya existe por teléfono
    const existingUserByPhone = await this.userRepository.findOne({
      where: { phone },
    });

    if (existingUserByPhone) {
      throw new ConflictException('El número de teléfono ya está registrado');
    }

    // Verificar si el email ya existe
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Verificar que el rol existe
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new ConflictException('El rol especificado no existe');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = this.userRepository.create({
      name,
      lastName,
      email,
      phone,
      password: hashedPassword,
      identification,
      address,
      city,
      state,
      zipCode,
      imageProfileUrl,
      birtDate,
      father,
      role,
    });

    await this.userRepository.save(newUser);

    // Enviar email de bienvenida con credenciales
    try {
      await this.brevoService.sendWelcomeEmail(
        newUser.name,
        newUser.lastName,
        newUser.email,
        password, // Contraseña sin hashear
      );
      this.logger.log(`Email de bienvenida enviado a ${newUser.email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error al enviar email de bienvenida a ${newUser.email}: ${errorMessage}`,
      );
      // No lanzamos el error para no bloquear el registro
    }

    // Generar token JWT
    const payload: JwtPayload = {
      sub: newUser.id.toString(),
      phone: newUser.phone,
    };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: newUser.id.toString(),
        name: newUser.name,
        phone: newUser.phone,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { phone, password } = loginDto;

    // Buscar usuario por teléfono
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload: JwtPayload = {
      sub: user.id.toString(),
      phone: user.phone,
    };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id.toString(),
        name: user.name,
        phone: user.phone,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: Number.parseInt(userId) },
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id.toString(),
      name: user.name,
      phone: user.phone,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      select: [
        'id',
        'name',
        'lastName',
        'email',
        'phone',
        'identification',
        'address',
        'city',
        'state',
        'zipCode',
        'imageProfileUrl',
        'birtDate',
        'father',
        'createdAt',
        'updatedAt',
      ],
      relations: ['role'],
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
