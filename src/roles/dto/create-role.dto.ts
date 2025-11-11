import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Admin',
    description: 'El nombre del rol',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
