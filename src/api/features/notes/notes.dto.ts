import { Note } from './note.entity.js';

export class CreateNotesDto {
  note!: string;
}

export class NoteSearchResult {
  note!: Note;
  distance!: number;
}
