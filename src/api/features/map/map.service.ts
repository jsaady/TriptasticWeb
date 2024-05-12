import { Injectable } from '@nestjs/common';
import { access, readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { ConfigService } from '../../utils/config/config.service.js';
const CACHE_DIR = resolve(new URL(import.meta.url).pathname, '..', '..', '..', '..', '..', 'cache');
console.log('CACHE', CACHE_DIR);
@Injectable()
export class MapService {
  constructor(
    private config: ConfigService
  ) {}

  async fetchMap(
    s: string,
    z: string,
    x: string,
    y: string,
  ) {
    const url = `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}`;
  
    const location = resolve(CACHE_DIR, `${s}_${z}_${x}_${y}`);
    
    try {
      await access(location);
    } catch {
      const res = await fetch(url);
      const raw = await res.arrayBuffer();

      await writeFile(location, Buffer.from(raw));
    }

    return location;
  }

  fetchStadiaKey() {
    return this.config.getOrThrow('stadiaMapApiKey');
  }
}
