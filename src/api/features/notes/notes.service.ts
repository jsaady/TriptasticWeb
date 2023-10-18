import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import PgBoss, { Job } from 'pg-boss';
import { InjectPGBoss } from '../../utils/queue/index.js';
import { ProcessQueue, ScheduledQueue } from '../../utils/queue/queue.decorator.js';
import { SocketIOPropagatorService } from '../../utils/sockets/socket.propagator.js';
import { ChatService, InjectChat } from '../ai/chat.service.js';
import { EmbeddingsService, InjectEmbeddingsService } from '../ai/embeddings.service.js';
import { Note } from './note.entity.js';

@Injectable()
export class NotesService {
  logger = new Logger('NotesService');
  constructor (
    @InjectEmbeddingsService()
    private embeddingsService: EmbeddingsService,
    @InjectChat()
    private chatService: ChatService,
    @InjectRepository(Note)
    private noteRepo: EntityRepository<Note>,
    @InjectPGBoss() private pgBoss: PgBoss,
    private sockets: SocketIOPropagatorService
  ) { }

  private get em(): EntityManager {
    return this.noteRepo.getEntityManager() as EntityManager;
  }

  @ProcessQueue('set_embeddings')
  async setEmbeddings(job: Job<{ id: number }>) {
    const note = await this.noteRepo.findOneOrFail({ id: job.data.id });
    
    note.embeddings = await this.embeddingsService.getEmbeddings(note.note);
    
    note.hasEmbeddings = true;
    
    await this.noteRepo.getEntityManager().persistAndFlush(note);
    
    this.sockets.emitToUser({
      userId: note.createdBy.toString(),
      channel: 'notes:updated',
      message: ''
    });
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

    this.pgBoss.send({
      name: 'set_embeddings',
      data: {
        id: newNote.id
      }
    });

    return newNote;
  }

  async getNotesForUser(userId: number) {
    return this.noteRepo.find({ createdBy: userId });
  }

  async getReleventNotes(prompt: string, userId: number) {
    const embeddings = await this.embeddingsService.getEmbeddings(prompt);

    const qb = this.em.createQueryBuilder(Note)
      .getKnex()
      .select('*')
      .where({
        created_by: userId,
        has_embeddings: true,
      })
      .orderByRaw('embeddings <-> ?', [JSON.stringify(embeddings)])
      .limit(20);

    const foundNotes: any[] = await qb;

    return foundNotes.map((foundNote: Record<string, any>) => this.noteRepo.map(foundNote));
  }

  async getChatResponseForRelevantNotes(notes: Note[], note: string, userId: number) {
    const rootContext = 'You are a personal assistant tasked with helping the user with something. The user is using an app that keeps track of relevant notes. Your responses should be very short (3-5 sentences) and be very condensed';
    const noNoteContext = 'The user has not entered any notes yet, please give them some pointers on what kinds of notes you would find useful to help them in the future. Be sure to mention the fact that they have not entered any notes yet and this app will not be very useful without them';
    const withNoteContext = `Below is a list of notes the user has entered that could be related to this subject:

${notes.map(n => `#${n.id} (${n.createdAt}) - "${n.note.replace(/\"/g, "'")}"`).join('\n')}

Please provide a response using common sense and ideally related to the notes above. Please also prioritize reminding the user of things they've mentioned in their notes. If nothing seems relevant give the user some pointers on what to take note of in the near future.
    `;

    const fullContext = rootContext + '\n\n' + (notes.length ? withNoteContext : noNoteContext);

    for await (const message of this.chatService.getReplyStream(note, fullContext)) {
      await this.sockets.emitToUser({
        userId: userId.toString(),
        message,
        channel: 'chatbot:new_token'
      });
    }
  }



  @ScheduledQueue('*/15 * * * *')
  async resyncEmbeddings(job: Job) {
    const notes = await this.em.find(Note, { hasEmbeddings: false });

    let i = 0;
    for (const note of notes) {
      job;
      const start = Date.now();
      note.embeddings = await this.embeddingsService.getEmbeddings(note.note);
      note.hasEmbeddings = true;
      this.logger.log(`${++i} of ${notes.length} re-embedded in ${Date.now() - start}ms`);
      await this.em.flush();
      this.sockets.emitToUser({
        userId: note.createdBy.toString(),
        channel: 'notes:updated',
        message: ''
      });
    }
  }
}
