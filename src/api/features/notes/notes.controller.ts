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
    @Body() { note }: CreateNotesDto,
    @User() { sub }: AuthTokenContents
  ) {
    return this.notesService.createNote(note, sub);
  }

  @Get()
  async getNotes (
    @User() { sub }: AuthTokenContents
  ) {
    return this.notesService.getNotesForUser(sub);
  }

  @Post('/search')
  async searchNotes (
    @Body() { note }: { note: string },
    @User() { sub }: AuthTokenContents
  ) {
    return this.notesService.getMostRelevantNotes(note, sub);
  }
}
