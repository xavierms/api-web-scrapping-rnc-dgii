import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Company } from '../interfaces/company.intercface';

@Injectable()
export class WebScrappingService {
  browser: puppeteer.Browser | null = null;

async getCompanyByRNC(rnc: string): Promise<Company> {
   

  try {
    // Reutilizar la instancia de Puppeteer si está disponible
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } else {
      this.browser = this.browser;
    }

    const page = await  this.browser.newPage();
    const rncURL = 'https://www.dgii.gov.do/app/WebApps/ConsultasWeb/consultas/rnc.aspx';
    const inputRNCSelector = 'input[name="ctl00$cphMain$txtRNCCedula"]';

    await page.goto(rncURL);
    const inputRNC = await page.waitForSelector(inputRNCSelector);

    await inputRNC.type(rnc);
    await inputRNC.press('Enter');

    // Esperar a que aparezca un mensaje de error
    const errorMessage = await page.$('#ctl00_cphMain_lblInformacion');
    if (errorMessage) {
      throw new Error('No se encontraron datos registrados de este contribuyente');
    }

    // Esperar a que aparezcan los datos en la tabla
    await page.waitForFunction(() => {
      const tableRows = document.querySelectorAll(
        '#ctl00_cphMain_dvDatosContribuyentes > tbody > tr'
      );
      return tableRows.length > 0;
    });

    // Utilizar funciones auxiliares para obtener datos específicos
    const company: Company = await this.extractCompanyData(page);

    return company;
  } finally {
    // No cierres el navegador si estás reutilizando la instancia
    if (!this.browser) {
      await this.closeBrowser( this.browser!);
    }
  }
}

async extractCompanyData(page: puppeteer.Page): Promise<Company> {
  const company: Company = await page.evaluate(() => {
    const tableRows = document.querySelectorAll(
      '#ctl00_cphMain_dvDatosContribuyentes > tbody > tr'
    );

    return {
      rnc: tableRows[0]?.children[1]?.textContent?.replace(/[\s-]/g, '') || '',
      tradename: tableRows[1]?.children[1]?.textContent?.trim() || '',
      name: tableRows[2]?.children[1]?.textContent?.trim() || '',
      category: tableRows[3]?.children[1]?.textContent?.trim() || '',
      paymentRegime: tableRows[4]?.children[1]?.textContent?.trim() || '',
      status: tableRows[5]?.children[1]?.textContent?.trim() || '',
      economicActivity: tableRows[6]?.children[1]?.textContent?.trim() || '',
      localManagement: tableRows[7]?.children[1]?.textContent?.trim() || '',
    };
  });

  return company;
}


  private async closeBrowser(browser: puppeteer.Browser) {
    if (browser && !browser.isConnected()) {
      await browser.close();
    }
  }
}
