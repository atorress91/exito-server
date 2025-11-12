import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { Country } from '../auth/entities/country.entity';

@ApiTags('countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los países' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los países',
    type: [Country],
  })
  async findAll(): Promise<Country[]> {
    return await this.countriesService.findAll();
  }
}
