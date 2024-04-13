import { Module } from '@nestjs/common';
import { StopsController } from './stops.controller.js';
import { StopsService } from './stops.service.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Stop } from './entities/stop.entity.js';
import { Trip } from './entities/trip.entity.js';

@Module({
  imports: [MikroOrmModule.forFeature([Stop, Trip])],
  controllers: [StopsController],
  providers: [StopsService]
})
export class StopsModule { }
