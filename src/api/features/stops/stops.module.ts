import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller.js';
import { AttachmentService } from './attachment.service.js';
import { Stop } from './entities/stop.entity.js';
import { Trip } from './entities/trip.entity.js';
import { GoogleStopImportController } from './googleImport.controller.js';
import { GoogleStopImportService } from './googleStopImport.service.js';
import { StopsController } from './stops.controller.js';
import { StopsService } from './stops.service.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [MikroOrmModule.forFeature([Stop, Trip]), UsersModule],
  controllers: [StopsController, AttachmentController, GoogleStopImportController],
  providers: [StopsService, AttachmentService, GoogleStopImportService]
})
export class StopsModule { }
