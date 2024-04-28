import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { IsAuthenticated } from '../auth/isAuthenticated.guard.js';
import { Stop } from './entities/stop.entity.js';
import { StopsService } from './stops.service.js';

@Controller('stops')
@IsAuthenticated()
export class StopsController {
  constructor(
    private stopService: StopsService
  ) {}

  @Post()
  create(@Body() body: Pick<Stop, 'latitude'|'longitude'|'name'>) {
    return this.stopService.create(body);
  }

  @Delete(':id')
  deleteStop(
    @Param('id') id: number
  ) {
    return this.stopService.delete(id);
  }

  @Get('trip/:tripId')
  getByTripId(@Param('tripId') tripId: string) {
    if (isNaN(+tripId)) {
      throw new BadRequestException(`Bad trip ID ${tripId}`);
    }

    return this.stopService.getStopsByTrip(+tripId);
  }
}