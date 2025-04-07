import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { CostingModule } from './costing/costing.module';

@Module({
  imports: [ConfigModule, CostingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
