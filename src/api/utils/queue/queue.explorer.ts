import { Injectable } from '@nestjs/common';
import { Injector } from '@nestjs/core/injector/injector.js';

@Injectable()
export class QueueExplorer {
  constructor (
    private injector: Injector
  ) { }
}
