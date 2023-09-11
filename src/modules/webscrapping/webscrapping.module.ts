/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CompanyController } from './controller/company-controller';
import { WebScrappingService } from './service/web-scrapping.service';


@Module({
  controllers: [CompanyController],
  providers:[WebScrappingService]
})
export class WebScrappingModule {}
 