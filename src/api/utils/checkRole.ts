import { CanActivate, ExecutionContext, Injectable, UseGuards, applyDecorators } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthTokenContents } from '../features/auth/auth.dto.js';
import { UserRole } from '../features/users/userRole.enum.js';


// A role set is an exlusive list of roles that a user must have to access a route
// The list of role sets are evaluated as ORs
// ex. [[role1, role2], [role3, role4]] => (role1 AND role2) OR (role3 AND role4)
export const AttachRoleSets = Reflector.createDecorator<UserRole[][]>();

@Injectable()
export class CheckRoleGuard implements CanActivate {
  constructor (
    private reflector: Reflector
  ) { }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      return false;
    }

    const user: AuthTokenContents = request.user;


    const desiredRoles = this.reflector.getAllAndMerge(AttachRoleSets, [context.getHandler(), context.getClass()]);

    // TODO: add support for users having multiple roles
    return desiredRoles.some(roleSet => roleSet.every(role => user.role === role));
  }
}

export const HasAllRoles = (roles: UserRole[]) => applyDecorators(AttachRoleSets([roles]), UseGuards(CheckRoleGuard));
export const HasOneRoles = (roles: UserRole[]) => applyDecorators(AttachRoleSets(roles.map(role => [role])), UseGuards(CheckRoleGuard));
export const HasRole = (role: UserRole) => applyDecorators(AttachRoleSets([[role]]), UseGuards(CheckRoleGuard));
