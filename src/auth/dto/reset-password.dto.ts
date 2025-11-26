import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123def456',
    description: 'Código de seguridad recibido por email',
  })
  @IsString({ message: 'El código debe ser un string' })
  @IsNotEmpty({ message: 'El código es requerido' })
  code: string;

  @ApiProperty({
    example: 'NewP@ssw0rd123',
    description: 'Nueva contraseña',
    minLength: 8,
  })
  @IsString({ message: 'La contraseña debe ser un string' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
}
