import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { MFA_ENABLED } from '../../utils/config/config.js';
import { User as UserEntity } from '../users/users.entity.js';
import { UserService } from '../users/users.service.js';
import { AUTH_TOKEN_EXPIRATION } from './auth.constants.js';
import { AuthLoginDTO, AuthRegisterDTO, AuthRegisterDeviceDTO, AuthTokenContents, UpdatePasswordDTO, VerifyEmailDTO } from './auth.dto.js';
import { AuthService } from './auth.service.js';
import { IsAuthenticated } from './isAuthenticated.guard.js';
import { User } from './user.decorator.js';
import { WebAuthnService } from './webAuthn.service.js';

@Controller('/auth')
export class AuthController {
  constructor (
    private authService: AuthService,
    private webAuthnService: WebAuthnService,
    private userService: UserService
  ) { }

  @Post('/start')
  async start(@Body() { username, registerDevice }: { username: string; registerDevice?: boolean }) {
    return this.authService.start(username, registerDevice);
  }

  @Post('/register-device')
  async registerDevice(@Body() dto: AuthRegisterDeviceDTO, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.continueDeviceRegistration(dto);

    return this.processUserLogin(result, response, dto.clientIdentifier, null);
  }

  @Post('/register')
  async register(@Body() dto: AuthRegisterDTO, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.continueRegistration(dto);

    return this.processUserLogin(result, response, dto.clientIdentifier, null);
  }

  @Post('/login')
  async login(@Body() dto: AuthLoginDTO, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.continueLogin(dto);

    return this.processUserLogin(result, response, dto.clientIdentifier, null);
  }

  @Post('/update-password')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async updatePassword(
    @User() { email, clientIdentifier, needPasswordReset }: AuthTokenContents,
    @Res({ passthrough: true }) response: Response,
    @Body() body: UpdatePasswordDTO
  ) {
    try {
      const updatedUser = await this.authService.updatePasswordForUser(email, body.currentPassword, body.password);

      return this.processUserLogin(updatedUser, response, clientIdentifier, null);
    } catch (e) {
      if (needPasswordReset) throw e;
      throw new BadRequestException('Invalid current password');
    }
  }


  @Post('/send-verification-email')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async sendVerificationEmail(@User() { sub }: AuthTokenContents, @Body() {force = false}: {force?: boolean}) {
    await this.authService.initiateEmailVerification(sub, force);

    return { success: true };
  }

  @Post('/verify-email')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async verifyEmail(@User() { sub , clientIdentifier}: AuthTokenContents, @Res({ passthrough: true }) response: Response, @Body() { token }: VerifyEmailDTO) {
    const updatedUser = await this.authService.validateEmailToken(sub, token);
    return this.processUserLogin(updatedUser, response, clientIdentifier, 'email');
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('Authorization');

    return {};
  }

  @Get('/check')
  @IsAuthenticated({ allowExpiredPassword: true, allowNoMFA: true, allowUnverifiedEmail: true })
  async checkAuth(@User() token: AuthTokenContents, @Res({ passthrough: true }) response: Response) {
    const user = await this.userService.getUserById(token.sub);

    return await this.processUserLogin(user, response, token.clientIdentifier, token.mfaMethod);
  }


  @Get('web-authn/devices')
  @IsAuthenticated()
  async getMyDevices(@User() { sub }: AuthTokenContents) {
    return this.webAuthnService.getDevicesByUserId(sub);
  }

  @Delete('web-authn/devices/:id')
  @IsAuthenticated()
  async removeDevice(@Param('id') id: string, @User() { sub }: AuthTokenContents) {
    return this.webAuthnService.removeDeviceById(+id, sub);
  }

  private async processUserLogin (user: UserEntity, response: Response<any, Record<string, any>>, clientIdentifier: string, mfaMethod: string | null) {
    const existingUserDevice = await this.authService.checkUserClientIdentifier(user.id, clientIdentifier);

    if (existingUserDevice) {
      mfaMethod = 'client_identifier';
    } else if (mfaMethod && MFA_ENABLED) {
      await this.authService.registerUserClientIdentifier(user.id, clientIdentifier);
    }

    const [token, contents] = await this.authService.mintDTOForUser(user, clientIdentifier, mfaMethod);

    response.cookie('Authorization', Buffer.from(JSON.stringify(token)).toString('base64'), {
      maxAge: AUTH_TOKEN_EXPIRATION * 1000,
      httpOnly: true,
      signed: true
    });

    if (!user.emailConfirmed) {
      return {
        success: false,
        code: 'verify_email',
        data: contents
      };
    }

    return {
      success: true,
      code: '',
      data: contents
    };
  }

}
