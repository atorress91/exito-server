import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../auth/entities/role.entity';

@Injectable()
export class RolesSeederService implements OnModuleInit {
  private readonly logger = new Logger(RolesSeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    this.logger.log('Iniciando seed de roles...');

    const defaultRoles = [{ name: 'admin' }, { name: 'client' }];

    for (const roleData of defaultRoles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (existingRole) {
        this.logger.log(`Rol '${roleData.name}' ya existe`);
      } else {
        const newRole = this.roleRepository.create(roleData);
        await this.roleRepository.save(newRole);
        this.logger.log(`Rol '${roleData.name}' creado exitosamente`);
      }
    }

    this.logger.log('Seed de roles completado');
  }
}
