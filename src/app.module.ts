import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebScrappingModule } from './modules/webscrapping/webscrapping.module';

@Module({
  imports: [WebScrappingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
