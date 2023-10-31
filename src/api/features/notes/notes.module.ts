import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '../../utils/config/config.module.js';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { Note } from './note.entity.js';
import { NotesController } from './notes.controller.js';
import { NotesService } from './notes.service.js';

@Module({
  imports: [
    AiModule,
    // MulterModule.register(multerConfig),
    MikroOrmModule.forFeature([Note]),
    AuthModule,
    ConfigModule
  ],
  controllers: [NotesController],
  providers: [NotesService]
})
export class NotesModule { }
