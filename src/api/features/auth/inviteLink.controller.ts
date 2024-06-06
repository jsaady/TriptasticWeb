import { Controller, Get } from '@nestjs/common';
import { InviteLinkService } from './inviteLink.service.js';
import { IsAuthenticated } from './isAuthenticated.guard.js';
import { HasOneRoles } from '../../utils/checkRole.js';
import { UserRole } from '../users/userRole.enum.js';

@Controller('auth/invite-link')
export class InviteLinkController {
  constructor(
    private inviteLinkService: InviteLinkService
  ) {}

  @Get()
  @IsAuthenticated()
  @HasOneRoles([UserRole.ADMIN, UserRole.USER])
  async getInviteLink() {
    return this.inviteLinkService.getInviteLink();
  }
}
