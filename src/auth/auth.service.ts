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
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  RegisterDto,
  PaginationDto,
  GetUnilevelTreeDto,
  UpdateProfileDto,
} from './dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

import {
  UnilevelTreeNode,
  UnilevelTreeResponse,
} from './interfaces/unilevel-tree.interface';
import {
  PersonalNetworkNode,
  PersonalNetworkResponse,
} from './interfaces/personal-network.interface';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Country } from './entities/country.entity';
import { EmailAttachment, EmailService } from '../email';
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
    private readonly configService: ConfigService,
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
      status: false, // Inicia como false hasta que verifique el email
      verificationCode: this.generateVerificationCode(),
      termsConditions: true,
      side: 0,
      ...(country && { country }),
    });

    await this.userRepository.save(newUser);

    // Enviar email de bienvenida con PDF en segundo plano (con timeout de 3s)
    Promise.race([
      this.sendWelcomeEmail(newUser, password),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email timeout')), 3000),
      ),
    ]).catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Email encolado en segundo plano para ${newUser.email}: ${errorMessage}`,
      );
    });

    // Generar token JWT
    const payload: JwtPayload = {
      sub: newUser.id.toString(),
      phone: newUser.phone,
      role: newUser.role.name,
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
        createdAt: true,
        updatedAt: true,
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
      role: user.role.name,
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
      relations: ['role'],
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id.toString(),
      name: user.name,
      phone: user.phone,
      role: user.role.name,
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

  async getUnilevelTree(
    requestingUser: { id: string; phone: string },
    unilevelTreeDto: GetUnilevelTreeDto,
  ): Promise<UnilevelTreeResponse> {
    const { userId, maxLevel = 10 } = unilevelTreeDto;

    // Obtener el usuario completo con su rol para verificar si es admin
    const user = await this.userRepository.findOne({
      where: { id: Number.parseInt(requestingUser.id) },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el usuario es admin comparando por ID del rol
    // Admin tiene role_id = 1, Client tiene role_id = 2
    const isAdmin = user.role?.id === 1;

    // Si no es admin, solo puede ver su propio árbol
    const targetUserId =
      isAdmin && userId ? userId : Number.parseInt(requestingUser.id);

    // Ejecutar el stored procedure
    const query = `
      SELECT * FROM get_unilevel_family_tree($1, $2, $3)
    `;

    const tree: UnilevelTreeNode[] = await this.userRepository.query(query, [
      targetUserId,
      maxLevel,
      isAdmin,
    ]);

    // Calcular el nivel máximo real en el resultado
    const maxLevelInTree =
      tree.length > 0 ? Math.max(...tree.map((node) => node.level)) : 0;

    return {
      tree,
      totalNodes: tree.length,
      maxLevel: maxLevelInTree,
    };
  }

  async getPersonalNetwork(
    requestingUser: { id: string; phone: string; role: string },
    userId?: number,
  ): Promise<PersonalNetworkResponse> {
    // Verificar si el usuario es admin usando el nombre del rol
    const isAdmin = requestingUser.role === 'Admin';

    // Si no es admin, solo puede ver su propia red
    const targetUserId =
      isAdmin && userId ? userId : Number.parseInt(requestingUser.id);

    // Ejecutar el stored procedure
    const query = `SELECT * FROM get_personal_network($1)`;

    const network: PersonalNetworkNode[] = await this.userRepository.query(
      query,
      [targetUserId],
    );

    return {
      network,
      totalNodes: network.length,
    };
  }

  private applyProfileUpdates(user: User, dto: UpdateProfileDto): void {
    const updatableFields: (keyof UpdateProfileDto)[] = [
      'name',
      'lastName',
      'identification',
      'address',
      'city',
      'state',
      'zipCode',
      'imageProfileUrl',
      'birtDate',
      'father',
      'side',
      'status',
      'termsConditions',
    ];

    for (const field of updatableFields) {
      if (dto[field] !== undefined) {
        user[field] = dto[field];
      }
    }
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: Number.parseInt(userId) },
      relations: ['role', 'country'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Aplicar solo los campos mutables proporcionados, excluyendo email y phone
    this.applyProfileUpdates(user, updateProfileDto);

    // Manejar actualización del país si se proporciona
    if (updateProfileDto.countryId !== undefined) {
      const country = await this.countryRepository.findOne({
        where: { id: updateProfileDto.countryId },
      });

      if (!country) {
        throw new NotFoundException('El país especificado no existe');
      }

      user.country = country;
    }

    const updatedUser = await this.userRepository.save(user);

    // Eliminar password del objeto de respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }

  /**
   * Genera un código de verificación único
   */
  private generateVerificationCode(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Verifica el email del usuario usando el código de verificación
   */
  async verifyEmail(
    code: string,
  ): Promise<{ message: string; user: Partial<User> }> {
    // Buscar usuario por código de verificación
    const user = await this.userRepository.findOne({
      where: { verificationCode: code },
      relations: ['role', 'country'],
    });

    if (!user) {
      throw new NotFoundException('Código de verificación inválido o expirado');
    }

    // Verificar si ya está verificado
    if (user.status) {
      throw new ConflictException('Esta cuenta ya ha sido verificada');
    }

    // Activar la cuenta
    user.status = true;
    user.verificationCode = undefined; // Limpiar el código usado
    await this.userRepository.save(user);

    // Eliminar password del objeto de respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    this.logger.log(`Usuario ${user.email} verificado exitosamente`);

    return {
      message: 'Cuenta activada exitosamente',
      user: userWithoutPassword,
    };
  }

  /**
   * Envía el email de bienvenida con PDF de forma asíncrona
   */
  private async sendWelcomeEmail(
    user: User,
    plainPassword: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    const welcomeEmailHtml = getWelcomeEmailTemplate({
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      password: plainPassword,
      verificationCode: user.verificationCode || '',
      frontendUrl,
    });

    // Determinar la ruta del PDF
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const termsFilePath = path.join(
      process.cwd(),
      isDevelopment ? 'src' : 'dist',
      'assets',
      'docs',
      'terminos-condiciones.pdf',
    );

    let attachments: EmailAttachment[] = [];

    // Intentar leer el PDF, pero no fallar si no existe
    try {
      const fileBuffer = await fs.readFile(termsFilePath);
      attachments = [
        {
          name: 'Terminos_y_Condiciones.pdf',
          content: fileBuffer.toString('base64'),
        },
      ];
      this.logger.log(`PDF adjuntado para ${user.email}`);
    } catch {
      this.logger.warn(
        `PDF no encontrado en ${termsFilePath}, enviando email sin adjunto`,
      );
    }

    // Encolar el email (esto solo añade a la cola, no envía)
    await this.emailService.queueEmail({
      to: [{ email: user.email, name: `${user.name} ${user.lastName}` }],
      subject: '¡Bienvenido a Éxito Juntos!',
      htmlContent: welcomeEmailHtml,
      attachments,
    });

    this.logger.log(`Email con PDF encolado correctamente para ${user.email}`);
  }
}
