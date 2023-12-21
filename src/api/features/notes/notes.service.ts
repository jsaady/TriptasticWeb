import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import PgBoss, { Job } from 'pg-boss';
import { SocketIOPropagatorService } from '@nestjs-enhanced/sockets';
import { ChatService, InjectChat } from '../ai/chat.service.js';
import { EmbeddingsService, InjectEmbeddingsService } from '../ai/embeddings.service.js';
import { InjectSTTService, STTService } from '../ai/stt.service.js';
import { Note } from './note.entity.js';
import { NoteSearchResult } from './notes.dto.js';
import { ProcessQueue, ScheduledQueue } from '@nestjs-enhanced/pg-boss';
import { RequestContextService } from '@nestjs-enhanced/context';

@Injectable()
export class NotesService {
  logger = new Logger('NotesService');
  constructor (
    @InjectEmbeddingsService()
    private embeddingsService: EmbeddingsService,
    @InjectChat()
    private chatService: ChatService,
    @InjectSTTService()
    private sttService: STTService,
    @InjectRepository(Note)
    private noteRepo: EntityRepository<Note>,
    private pgBoss: PgBoss,
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

    return this.pgBoss.send('send_chat_response', {
      socketId,
      notes,
      prompt,
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

    this.pgBoss.send('set_embeddings', {
      id: newNote.id
    });

    return newNote;
  }

  async getNotesForUser() {
    return this.noteRepo.find({ createdBy: this.context.getContext()?.user.sub });
  }

  async getReleventNotes(prompt: string): Promise<NoteSearchResult[]> {
    const embeddings = await this.embeddingsService.getEmbeddings(prompt);
    const knex = this.em.getKnex();
    const foundNotes: any[] = await this.em.createQueryBuilder(Note).getKnex()
      .select('*')
      .select(knex.raw('embeddings <-> ? as embeddings_distance', [JSON.stringify(embeddings)]))
      .where({
        created_by: this.context.getContext()?.user.sub,
        has_embeddings: true,
      })
      .orderByRaw('embeddings_distance')
      .limit(5);


    return foundNotes.map((foundNote: Record<string, any>) => ({
      note: this.noteRepo.map(foundNote),
      distance: +foundNote.embeddings_distance
    }));
  }

  async getChatResponseForRelevantNotes(notes: Note[], note: string, socketId: string) {
    const rootContext = `
# Context:
You are an intelligent personal assistant chatbot. Your primary role is to assist the user by providing suggestions and advice based on their stored notes. Your responses should be brief, precise, and directly related to the user's queries.

# User Interaction:
The user engages with you through an app that has a repository of their personal notes. These notes contain various pieces of information that the user has found important.

# Your Task:
Provide responses that are concise (3-5 sentences) and to the point.
Make sure to address the user directly in your responses.
Use markdown for clarity where appropriate.
Refer to the user's notes when providing suggestions or advice. Highlight how specific notes are relevant to their current query.
If the user's notes don't directly relate to their query, guide them on what kind of information could be useful for similar future inquiries.    
`;
    const noNoteContext = 'The user has not entered any notes yet, please give them some pointers on what kinds of notes you would find useful to help them in the future. Be sure to mention the fact that they have not entered any notes yet and this app will not be very useful without them';
    const withNoteContext = `# User's Notes:
    Here are some examples of notes the user might have:    

${notes.map(n => `#${n.id} (${n.createdAt}) - "${n.note.replace(/\"/g, "'")}"`).join('\n')}
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

  async transcribeText(file: Express.Multer.File) {
    let data = '';

    for await (const chunk of this.sttService.audioStreamToText(Buffer.from(file.buffer))) {
      data += chunk;
    }

    return data;
  }

  @ScheduledQueue('* * * * *')
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
