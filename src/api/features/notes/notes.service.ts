import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import PgBoss, { Job } from 'pg-boss';
import { RequestContextService } from '../../utils/context/request-context.service.js';
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
    private sockets: SocketIOPropagatorService,

    private context: RequestContextService
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

  scheduleSendChatResponse (notes: number[], prompt: string) {
    const socketId = this.context.getContext()?.get('x-socket-id');

    return this.pgBoss.send({
      name: 'send_chat_response',
      data: {
        socketId,
        notes,
        prompt,
      }
    });
  }
  
  @ProcessQueue('send_chat_response')
  async sendChatResponse (job: Job<{ notes: number[]; prompt: string; socketId: string; }>) {
    const notes = await this.noteRepo.find({
      id: {
        $in: job.data.notes
      }
    });

    return await this.getChatResponseForRelevantNotes(notes, job.data.prompt, job.data.socketId);
  }

  async createNote (note: string) {
    const em = this.noteRepo.getEntityManager();
    const newNote = em.create(Note, {
      note,
      embeddings: [0],
      hasEmbeddings: false,
      createdBy: this.context.getContext()?.user.sub
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

  async getNotesForUser() {
    return this.noteRepo.find({ createdBy: this.context.getContext()?.user.sub });
  }

  async getReleventNotes(prompt: string) {
    const embeddings = await this.embeddingsService.getEmbeddings(prompt);

    const qb = this.em.createQueryBuilder(Note)
      .getKnex()
      .select('*')
      .where({
        created_by: this.context.getContext()?.user.sub,
        has_embeddings: true,
      })
      .orderByRaw('embeddings <-> ?', [JSON.stringify(embeddings)])
      .limit(5);

    const foundNotes: any[] = await qb;

    return foundNotes.map((foundNote: Record<string, any>) => this.noteRepo.map(foundNote));
  }

  async getChatResponseForRelevantNotes(notes: Note[], note: string, socketId: string) {
    const rootContext = `You are a personal assistant tasked with helping the user with something. The user is using an app that keeps track of relevant notes and can provide useful context about the user's prompt. Your responses should be very short (3-5 sentences) and be very condensed`;
    const noNoteContext = 'The user has not entered any notes yet, please give them some pointers on what kinds of notes you would find useful to help them in the future. Be sure to mention the fact that they have not entered any notes yet and this app will not be very useful without them';
    const withNoteContext = `Below is a list of notes the user has entered that could be related to this subject:

${notes.map(n => `#${n.id} (${n.createdAt}) - "${n.note.replace(/\"/g, "'")}"`).join('\n')}

Please provide a response using common sense and ideally related to the notes above. Please also prioritize reminding the user of things they've mentioned in their notes. If nothing seems relevant give the user some pointers on what to take note of in the near future.
    `;

    const fullContext = rootContext + '\n\n' + (notes.length ? withNoteContext : noNoteContext);

    for await (const message of this.chatService.getReplyStream(note, fullContext)) {
      await this.sockets.emitToSocket({
        targetSocketId: socketId,
        message,
        channel: 'chatbot:new_token'
      });
    }
  }



  @ScheduledQueue('*/3 * * * *')
  async resyncEmbeddings(job: Job) {
    const notes = await this.em.find(Note, { hasEmbeddings: false });

    if ('bulkGetEmbeddings' in this.embeddingsService) {
      const start = Date.now();
      this.logger.log('Bulk re-embedding ' + notes.length + ' notes');
      const embeddings = await this.embeddingsService.bulkGetEmbeddings?.(notes.map(({ note }) => note))!;

      notes.forEach((note, index) => {
        notes[index].embeddings = embeddings[index];
        notes[index].hasEmbeddings = true;
      });

      const users = new Set(notes.map(note => note.createdBy));


      await this.em.flush();

      for (const user of users) {
        this.sockets.emitToUser({
          userId: user.toString(),
          channel: 'notes:updated',
          message: ''
        });
      }

      this.logger.log(`Re-embedded ${notes.length} notes in ${Date.now() - start}ms`);
      return;
    }

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
