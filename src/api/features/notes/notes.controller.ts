import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsAuthenticated } from '../auth/isAuthenticated.guard.js';
import { CreateNotesDto } from './notes.dto.js';
import { NotesService } from './notes.service.js';

@Controller('notes')
@IsAuthenticated()
export class NotesController {
  constructor (
    private notesService: NotesService
  ) { }

  @Post()
  async createNote (
    @Body() { note }: CreateNotesDto
  ) {
    return this.notesService.createNote(note);
  }

  @Get()
  async getNotes () {
    return this.notesService.getNotesForUser();
  }

  @Post('/search')
  async searchNotes (
    @Body() { note }: { note: string; socketId: string; },
    @Query('chat') chat: boolean
  ): Promise<[number, number][]> {
    const results = await this.notesService.getReleventNotes(note);
    const notes = results.map<[number, number]>(({ note: { id }, distance}) => [id, distance]);

    if (chat) {
      await this.notesService.scheduleSendChatResponse(notes.map(([id]) => id), note);
    }

    return notes;
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async playAudio(@UploadedFile() file: Express.Multer.File) {
    // const audioStream = createReadStream(file.path);
    const text = await this.notesService.transcribeText(file)

    return { text };
  }
}
