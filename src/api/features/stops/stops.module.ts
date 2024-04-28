import { Module } from '@nestjs/common';
import { StopsController } from './stops.controller.js';
import { StopsService } from './stops.service.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Stop } from './entities/stop.entity.js';
import { Trip } from './entities/trip.entity.js';
import { AttachmentService } from './attachment.service.js';
import { AttachmentController } from './attachment.controller.js';

@Module({
  imports: [MikroOrmModule.forFeature([Stop, Trip])],
  controllers: [StopsController, AttachmentController],
  providers: [StopsService, AttachmentService]
})
export class StopsModule { }
