import { CanActivate, ExecutionContext, Injectable, Logger, UseGuards, applyDecorators } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthTokenContents } from '../features/auth/auth.dto.js';
import { UserRole } from '../features/users/userRole.enum.js';
import { IsAuthenticated } from '../features/auth/isAuthenticated.guard.js';


// A role set is an exlusive list of roles that a user must have to access a route
// The list of role sets are evaluated as ORs
// ex. [[role1, role2], [role3, role4]] => (role1 AND role2) OR (role3 AND role4)
export const AttachRoleSets = Reflector.createDecorator<UserRole[][]>();

@Injectable()
export class CheckRoleGuard implements CanActivate {
  logger = new Logger('CheckRoleGuard');

  constructor (
    private reflector: Reflector
  ) { }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const desiredRoles = this.reflector.getAllAndMerge(AttachRoleSets, [context.getHandler(), context.getClass()]);
    const user: AuthTokenContents = request.user;
    this.logger.log(`Checking roles (${desiredRoles}) for user ${user?.sub}`);

    if (!user) {
      return false;
    }

    if (!desiredRoles) {
      return true;
    }

    // TODO: add support for users having multiple roles
    return desiredRoles.some(roleSet => roleSet.every(role => user.role === role));
  }
}

export const HasAllRoles = (roles: UserRole[]) => applyDecorators(IsAuthenticated(), AttachRoleSets([roles]), UseGuards(CheckRoleGuard));
export const HasOneRoles = (roles: UserRole[]) => applyDecorators(IsAuthenticated(), AttachRoleSets(roles.map(role => [role])), UseGuards(CheckRoleGuard));
export const HasRole = (role: UserRole) => applyDecorators(IsAuthenticated(), AttachRoleSets([[role]]), UseGuards(CheckRoleGuard));
