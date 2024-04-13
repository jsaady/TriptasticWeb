import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StopsService } from './stops.service.js';
import { Stop } from './entities/stop.entity.js';
import { IsAuthenticated } from '../auth/isAuthenticated.guard.js';

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

  @Get('trip/:tripId')
  getByTripId(@Param('tripId') tripId: string) {
    if (isNaN(+tripId)) {
      throw new BadRequestException(`Bad trip ID ${tripId}`);
    }

    return this.stopService.getStopsByTrip(+tripId);
  }
}