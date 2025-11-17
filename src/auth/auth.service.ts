import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, PaginationDto } from './dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Country } from './entities/country.entity';
import { EmailService } from '../email';
import { getWelcomeEmailTemplate } from '../email/templates/welcome-email.template';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const {
      name,
      lastName,
      email,
      phone: rawPhone,
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
      countryId,
    } = registerDto;

    // Limpiar el número de teléfono (eliminar + si existe)
    const phone = rawPhone.replace(/^\+/, '');

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

    // Verificar que el país existe si se proporciona
    let country: Country | null = null;
    if (countryId) {
      country = await this.countryRepository.findOne({
        where: { id: countryId },
      });

      if (!country) {
        throw new ConflictException('El país especificado no existe');
      }
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
      ...(country && { country }),
    });

    await this.userRepository.save(newUser);

    // Enviar email de bienvenida con credenciales (de forma asíncrona con cola)
    try {
      const welcomeEmailHtml = getWelcomeEmailTemplate({
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        password: password, // Contraseña sin hashear
      });

      await this.emailService.queueEmail({
        to: [
          { email: newUser.email, name: `${newUser.name} ${newUser.lastName}` },
        ],
        subject: '¡Bienvenido a Éxito Juntos!',
        htmlContent: welcomeEmailHtml,
      });

      this.logger.log(`Email de bienvenida encolado para ${newUser.email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error al encolar email de bienvenida para ${newUser.email}: ${errorMessage}`,
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

    // Buscar usuario por teléfono con relaciones
    const user = await this.userRepository.findOne({
      where: { phone },
      relations: ['role', 'country'],
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
        identification: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        imageProfileUrl: true,
        birtDate: true,
        father: true,
        side: true,
        status: true,
        termsConditions: true,
        password: true,
        role: {
          id: true,
          name: true,
        },
        country: {
          id: true,
          name: true,
        },
      },
    });
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

    // Eliminar password del objeto de respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
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

  async findByPhone(phone: string) {
    const user = await this.userRepository.findOne({
      where: { phone },
      relations: ['role'],
      select: {
        id: true,
        name: true,
        lastName: true,
        address: true,
        identification: true,
        phone: true,
        email: true,
        city: true,
        state: true,
        imageProfileUrl: true,
        father: true,
        side: true,
        termsConditions: true,
        role: {
          id: true,
          name: true,
        },
        birtDate: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }
}
