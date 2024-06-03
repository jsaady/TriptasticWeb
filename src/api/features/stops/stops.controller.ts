import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { HasRole } from '../../utils/checkRole.js';
import { IsAuthenticated } from '../auth/isAuthenticated.guard.js';
import { UserRole } from '../users/userRole.enum.js';
import { CreateStopDTO, StopDetailDTO, UpdateStopDTO } from './dto/stop.dto.js';
import { StopsService } from './stops.service.js';

@Controller('stops')
@IsAuthenticated()
export class StopsController {
  constructor(
    private stopService: StopsService
  ) {}

  @Post()
  @HasRole(UserRole.ADMIN)
  create(@Body() body: CreateStopDTO) {
    return this.stopService.create(body);
  }

  @Get(':id')
  getStop(@Param('id') id: number): Promise<StopDetailDTO> {
    return this.stopService.getStopById(id);
  }

  @Put(':id')
  @HasRole(UserRole.ADMIN)
  updateStop(
    @Param('id') id: number,
    @Body() body: UpdateStopDTO
  ) {
    return this.stopService.update(id, body);
  }

  @Put(':id/checkIn')
  @HasRole(UserRole.ADMIN)
  checkIn(
    @Param('id') id: number
  ) {
    return this.stopService.checkIntoStop(id);
  }

  @Delete(':id')
  @HasRole(UserRole.ADMIN)
  deleteStop(
    @Param('id') id: number
  ) {
    return this.stopService.delete(id);
  }

  @Get('trip/:tripId')
  getByTripId(@Param('tripId') tripId: string, @Query('q') q: string, @Query('limit') limit: string) {
    if (isNaN(+tripId)) {
      throw new BadRequestException(`Bad trip ID ${tripId}`);
    }

    if (limit && isNaN(+limit)) {
      throw new BadRequestException(`Bad limit ${limit}`);
    }

    return this.stopService.getStopsByTrip(+tripId, q, limit ? +limit : 0);
  }

  @Post(':id/attach')
  @HasRole(UserRole.ADMIN)
  @UseInterceptors(AnyFilesInterceptor())
  attach(
    @Param('id') id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.stopService.attachFiles(id, files);
  }

  @Get(':id/attachments')
  getAttachments(@Param('id') id: number) {
    return this.stopService.getAttachments(id);
  }

  @Delete(':id/attach/:attachId')
  @HasRole(UserRole.ADMIN)
  detach(
    @Param('id') id: string,
    @Param('attachId') attachId: string
  ) {
    return this.stopService.detachAttachment(+id, +attachId);
  }
}
