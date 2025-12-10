import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { ModelsModule } from 'src/common/models/Models.Module';

@Module({
  controllers: [CountryController],
  providers: [CountryService, ModelsModule],
})
export class CountryModule {}
