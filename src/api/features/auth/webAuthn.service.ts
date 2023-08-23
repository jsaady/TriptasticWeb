import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../users/users.service.js';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { GenerateRegistrationOptionsOpts, generateRegistrationOptions, VerifiedRegistrationResponse, VerifyRegistrationResponseOpts, verifyRegistrationResponse, GenerateAuthenticationOptionsOpts, generateAuthenticationOptions, VerifiedAuthenticationResponse, VerifyAuthenticationResponseOpts, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { isoUint8Array, isoBase64URL } from '@simplewebauthn/server/helpers';
import { RegistrationResponseJSON, AuthenticatorDevice, AuthenticationResponseJSON } from '@simplewebauthn/typescript-types';
import { APP_NAME, CONFIG_VARS } from '../../utils/config.js';
import { User } from './user.decorator.js';
import { UserDevice } from './userDevice.entity.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebAuthnService {

  private readonly rpName: string;
  private readonly rpId: string;

  constructor (
    private userService: UserService,
    @InjectRepository(UserDevice) private userDeviceRepo: EntityRepository<UserDevice>,
    configService: ConfigService
  ) {
    this.rpName = `${APP_NAME} - ${configService.getOrThrow(CONFIG_VARS.envName)}`;
    this.rpId = new URL(configService.getOrThrow(CONFIG_VARS.envUrl)).hostname;
  }
  async startWebAuthnRegistration (userId: number) {
    const [user, devices] = await Promise.all([
      this.userService.getUserById(userId),
      this.getDevicesByUserId(userId)
    ]);

    const opts: GenerateRegistrationOptionsOpts = {
      rpName: this.rpName,
      rpID: this.rpId,
      userID: '' + user.id,
      userName: user.email,
      timeout: 60000,
      attestationType: 'none',
      /**
       * Passing in a user's list of already-registered authenticator IDs here prevents users from
       * registering the same device multiple times. The authenticator will simply throw an error in
       * the browser if it's asked to perform registration when one of these ID's already resides
       * on it.
       */
      excludeCredentials: devices.map(dev => ({
        id: dev.credentialID,
        type: 'public-key',
        transports: dev.transports,
      })),
      authenticatorSelection: {
        residentKey: 'discouraged',
      },
      /**
       * Support the two most common algorithms: ES256, and RS256
       */
      supportedAlgorithmIDs: [-7, -257],
    };

    const options = generateRegistrationOptions(opts);

    await this.userService.updateUser(user, { currentWebAuthnChallenge: options.challenge });

    return options;
  }

  async verifyWebAuthnRegistration (userId: number, name: string, registrationResponse: RegistrationResponseJSON) {
    const [user, devices] = await Promise.all([
      this.userService.getUserById(userId),
      this.getDevicesByUserId(userId)
    ]);
    const expectedChallenge = user.currentWebAuthnChallenge;

    if (!expectedChallenge) {
      throw new BadRequestException('No current challenge exists');
    }

    let verification: VerifiedRegistrationResponse;

    try {
      const opts: VerifyRegistrationResponseOpts = {
        response: registrationResponse,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin: `https://${this.rpId}`,
        expectedRPID: this.rpId,
        requireUserVerification: true,
      };

      verification = await verifyRegistrationResponse(opts);
    } catch (e) {
      const error = e as Error;
      console.error(error);

      throw new BadRequestException(error.message);
    }

    const { verified, registrationInfo } = verification;


    if (verified && registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = registrationInfo;


      const existingDevice = devices.find(device => isoUint8Array.areEqual(device.credentialID, credentialID));

      if (!existingDevice) {
        /**
         * Add the returned device to the user's list of devices
         */
        const newDevice: AuthenticatorDevice = {
          credentialPublicKey,
          credentialID,
          counter,
          transports: registrationResponse.response.transports,
        };

        this.userDeviceRepo.create({
          ...newDevice,
          user,
          name
        });

        await this.userDeviceRepo.getEntityManager().flush();
      }
    }

    await this.userService.updateUser(user, { currentWebAuthnChallenge: null });

    return {
      verified,
      user
    };
  }

  async startWebAuthn(userId: number) {
    const [user, devices] = await Promise.all([
      this.userService.getUserById(userId),
      this.getDevicesByUserId(userId)
    ]);

    const opts: GenerateAuthenticationOptionsOpts = {
      timeout: 60000,
      allowCredentials: devices.map(dev => ({
        id: dev.credentialID,
        type: 'public-key',
        transports: dev.transports,
      })),
      userVerification: 'required',
      rpID: this.rpId,
    };

    
    const options = generateAuthenticationOptions(opts);
    await this.userService.updateUser(user, { currentWebAuthnChallenge: options.challenge });

    return options;
  }

  getDeviceCountByUserId (userId: number) {
    return this.userDeviceRepo.count({
      user: {
        id: userId
      }
    });
  }

  getDevicesByUserId (userId: number) {
    return this.userDeviceRepo.find({
      user: {
        id: userId
      }
    });
  }

  removeDeviceById (id: number, userId: number) {
    return this.userDeviceRepo.getEntityManager().nativeDelete(UserDevice, {
      user: {
        id: userId
      },
      id
    });
  }

  async verifyWebAuthn(userId: number, verificationOptions: AuthenticationResponseJSON) {
    const [user, devices] = await Promise.all([
      this.userService.getUserById(userId),
      this.getDevicesByUserId(userId)
    ]);

    const expectedChallenge = user.currentWebAuthnChallenge;

    const bodyCredIDBuffer = isoBase64URL.toBuffer(verificationOptions.rawId);

    // TODO: do the filter at the DB level
    const authenticator = devices.find(device => isoUint8Array.areEqual(device.credentialID, bodyCredIDBuffer));

    if (!authenticator) {
      throw new BadRequestException('Authenticator is not registered with this site');
    }

    let verification: VerifiedAuthenticationResponse;
    try {
      const opts: VerifyAuthenticationResponseOpts = {
        response: verificationOptions,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin: `https://${this.rpId}`,
        expectedRPID: this.rpId,
        authenticator,
        requireUserVerification: true
      };

      verification = await verifyAuthenticationResponse(opts);
    } catch (e) {
      console.error(e);
      throw new BadRequestException((e as Error).message);
    }

    if (verification.verified) {
      authenticator.counter = verification.authenticationInfo.newCounter;
      await this.userDeviceRepo.getEntityManager().flush();
    }

    await this.userService.updateUser(user, { currentWebAuthnChallenge: null });

    return {
      verified: verification.verified,
      user
    }
  }
}