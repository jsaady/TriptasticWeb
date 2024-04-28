import { Controller, Get, Param, Res } from '@nestjs/common';
import { MapService } from './map.service.js';
import { Response } from 'express';

@Controller('map')
export class MapController {
  constructor(
    private mapService: MapService
  ) {}

  @Get('/:s/:z/:x/:y')
  async getMap(
    @Param('s') s: string,
    @Param('z') z: string,
    @Param('x') x: string,
    @Param('y') y: string,
    @Res() res: Response
  ) {
    const imgLoc = await this.mapService.fetchMap(s, z, x, y);

    return res.sendFile(imgLoc);
  }
}
