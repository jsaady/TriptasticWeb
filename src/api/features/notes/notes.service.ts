import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ChatService, InjectChat } from '../ai/chat.service.js';
import { EmbeddingsService, InjectEmbeddingsService } from '../ai/embeddings.service.js';
import { Note } from './note.entity.js';

@Injectable()
export class NotesService {
  constructor (
    @InjectEmbeddingsService()
    private embeddingsService: EmbeddingsService,
    @InjectChat()
    private chatService: ChatService,
    @InjectRepository(Note)
    private noteRepo: EntityRepository<Note>
  ) { }

  private get em(): EntityManager {
    return this.noteRepo.getEntityManager() as EntityManager;
  }

  async setEmbeddings(id: number) {
    const note = await this.noteRepo.findOneOrFail({ id });

    note.embeddings = await this.embeddingsService.getEmbeddings(note.note);

    note.hasEmbeddings = true;

    await this.noteRepo.getEntityManager().persistAndFlush(note);
  }

  async createNote (note: string, userId: number) {
    const em = this.noteRepo.getEntityManager();
    const newNote = em.create(Note, {
      note,
      embeddings: [0],
      hasEmbeddings: false,
      createdBy: userId
    });

    await em.persistAndFlush(newNote);

    this.setEmbeddings(newNote.id);

    return newNote;
  }

  async getNotesForUser(userId: number) {
    return this.noteRepo.find({ createdBy: userId });
  }

  async getMostRelevantNotes(note: string, userId: number) {
    const embeddings = await this.embeddingsService.getEmbeddings(note);

    const qb = this.em.createQueryBuilder(Note)
      .getKnex()
      .select('*')
      .where({
        created_by: userId
      })
      .orderByRaw('embeddings <-> ?', [JSON.stringify(embeddings)])
      .limit(20);

    const foundNotes: any[] = await qb;

    const mappedNotes = foundNotes.map((foundNote: Record<string, any>) => this.noteRepo.map(foundNote));

    const context = `You are a personal assistant tasked with helping the user with something. Below is a list of notes the user has entered that could be related to this subject:
    
    ${mappedNotes.map(n => `#${n.id} (${n.createdAt}) - "${n.note.replace(/\"/g, "'")}"`).join('\n')}

    Please provide a response using common sense and ideally related to the notes above. Please also prioritize reminding the user of things they've mentioned in their notes.
    `;

    const chatResponse = await this.chatService.getReply(note, context);

    const ids = mappedNotes.map(({ id }) => id);

    return {
      chatResponse,
      ids
    };
  }

  async resyncEmbeddings() {
    const notes = await this.em.find(Note, { hasEmbeddings: false });

    let i = 0;
    for (const note of notes) {
      note.embeddings = await this.embeddingsService.getEmbeddings(note.note);
      console.log(`${++i} of ${notes.length} re-embedded`);
    }

    await this.em.flush();
  }
}
