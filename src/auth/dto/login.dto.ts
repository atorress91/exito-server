import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '+573001234567',
    description: 'El número de teléfono del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'El número de teléfono debe ser válido',
  })
  phone: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'La contraseña del usuario',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
