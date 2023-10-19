import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsAuthenticated } from '../auth/isAuthenticated.guard.js';
import { CreateNotesDto } from './notes.dto.js';
import { NotesService } from './notes.service.js';
import { User } from '../auth/user.decorator.js';
import { AuthTokenContents } from '../auth/auth.dto.js';

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
    @Body() { note }: { note: string; socketId: string; }
  ) {
    const notes = await this.notesService.getReleventNotes(note);
    const noteIds = notes.map(note => note.id);

    await this.notesService.scheduleSendChatResponse(noteIds, note);

    return noteIds;
  }
}
