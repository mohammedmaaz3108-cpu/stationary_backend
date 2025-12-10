import { Body, Controller, Get, Post } from '@nestjs/common';
import { CountryService } from './country.service';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get() async getCountry() {
    return this.countryService.getCountry();
  }

  @Post() async createCountry(@Body() body: any) {
    return this.countryService.createCountry(body);
  }
}
