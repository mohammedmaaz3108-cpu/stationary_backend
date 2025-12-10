import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FamilyService } from './family.service';

@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get() async getFamily() {
    return this.familyService.getFamily();
  }

  @Post() async createFamily(@Body() body: any) {
    return this.familyService.createFamily(body);
  }

  @Post('update') async updateFamily(@Body() body: any) {
    return this.familyService.updateFamily(body);
  }

  @Delete(':id') async deleteFamily(@Param('id') id: any) {
    return this.familyService.deleteFamily(id);
  }
}
