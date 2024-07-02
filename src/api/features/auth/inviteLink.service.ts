import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UserInvitation } from './entities/userInvitation.entity.js';
import { User } from '../users/users.entity.js';
import { wrap } from '@mikro-orm/core';
import { ConfigService } from '../../utils/config/config.service.js';
import { Request } from 'express';
import { AuthTokenContents } from './auth.dto.js';
import { UserRole } from '../users/userRole.enum.js';
import { v4 } from 'uuid';

@Injectable()
export class InviteLinkService {
  constructor (
    private authService: AuthService,
    private em: EntityManager,
    private config: ConfigService
  ) { }

  async extractInviteCodeFromRequest (request: Request): Promise<AuthTokenContents | null> {
    const inviteCode = request.headers['x-invite-code'] as string;

    if (!inviteCode) {
      return null;
    }

    const isValid = await this.checkInviteLink(inviteCode);

    return isValid ? {
      sub: -1,
      email: 'invite',
      role: UserRole.GUEST,
      emailConfirmed: true,
      needPasswordReset: false,
      clientIdentifier: inviteCode,
      mfaEnabled: true,
      mfaMethod: null,
      type: 'auth',
      username: 'invite'
    } : null;
  }

  async getInviteLink() {
    const userId = this.authService.getCurrentUserId();

    let inviteLink = await this.em.findOne(UserInvitation, { inviter: userId });

    if (!inviteLink) {
      inviteLink = this.em.create(UserInvitation, {
        inviter: this.em.getReference(User, userId),
        inviteCode: v4()
      });
      await this.em.persistAndFlush(inviteLink);
    }


    return {
      link: `${this.config.get('envUrl')}/invite/${inviteLink.inviteCode}`
    };
  }

  private async checkInviteLink(inviteCode: string) {
    const inviteLink = await this.em.findOne(UserInvitation, { inviteCode });

    if (!inviteLink) {
      return false;
    }

    return true;
  }
}
