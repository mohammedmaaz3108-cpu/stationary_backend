import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PlatformsService } from './platforms.service';

@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get() async getPlatforms() {
    return this.platformsService.getPlatforms();
  }

  @Post()
  async createPlatform(@Body() body: any) {
    return this.platformsService.createPlatform(body);
  }
  @Post('update')
  async updatePlatform(@Body() body: any) {
    return this.platformsService.updatePlatform(body);
  }

  @Delete(':id')
  async deletePlatform(@Param('id') id: number) {
    return this.platformsService.deletePlatform(id);
  }
}
