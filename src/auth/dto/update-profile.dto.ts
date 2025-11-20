import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nombre del usuario' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Apellido del usuario' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Número de identificación' })
  @IsString()
  @IsOptional()
  identification?: string;

  @ApiPropertyOptional({ description: 'Dirección del usuario' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Ciudad del usuario' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Estado o departamento del usuario' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Código postal' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen de perfil' })
  @IsString()
  @IsOptional()
  imageProfileUrl?: string;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  birtDate?: Date;

  @ApiPropertyOptional({ description: 'ID del usuario padre/referente' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  father?: number;

  @ApiPropertyOptional({
    description: 'Lado en el árbol binario (1=izquierda, 2=derecha)',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  side?: number;

  @ApiPropertyOptional({ description: 'Estado del usuario (activo/inactivo)' })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiPropertyOptional({ description: 'Aceptación de términos y condiciones' })
  @IsBoolean()
  @IsOptional()
  termsConditions?: boolean;

  @ApiPropertyOptional({ description: 'ID del país del usuario' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  countryId?: number;
}
