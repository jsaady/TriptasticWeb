import { Controller, Get } from '@nestjs/common';
import { GoogleStopImportService } from './googleStopImport.service.js';
import { IsAuthenticated } from '../auth/isAuthenticated.guard.js';
import { HasRole } from '../../utils/checkRole.js';
import { UserRole } from '../users/userRole.enum.js';

@Controller('google-import')
@HasRole(UserRole.ADMIN)
export class GoogleStopImportController {
  constructor(
    private readonly googleStopImportService: GoogleStopImportService,
  ) { }

  @Get()
  importStops() {
    return this.googleStopImportService.importStops();
  }
}
