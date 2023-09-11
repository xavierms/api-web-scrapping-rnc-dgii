import { Controller, Get, Param, Res } from '@nestjs/common';

import { Response } from 'express';

import { ErrorMessages } from '../error-messages.enum';

import { WebScrappingService } from '../service/web-scrapping.service';

@Controller('company')
export class CompanyController {

  constructor(private webScrappingService: WebScrappingService) {}

  @Get(':rnc')
  async getCompanyByRNC(@Param('rnc') rnc: string, @Res() res: Response) {
    try {
  
      const company = await this.webScrappingService.getCompanyByRNC(rnc);
      return res.status(200).json(company);

    } catch (error: any) {

      console.error(error);

      if ((error?.message as string).includes(ErrorMessages.NOT_FOUND)) {
        return res.status(404).json({
          message: ErrorMessages.NOT_FOUND,
        });
      }

      return res.status(500).json({
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
