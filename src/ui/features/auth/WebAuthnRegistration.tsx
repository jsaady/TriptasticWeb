import { startRegistration } from '@simplewebauthn/browser';
import { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import { useEffect } from 'react';
import { useForm } from '../../utils/forms.js';
import { useAsync, useAsyncHttp } from '../../utils/useAsync.js';
import { LoginButton, LoginForm, LoginInputEl } from './LoginElements.js';
import { LoginResponse } from './types.js';

export interface WebAuthnRegistrationFormProps {
  onRegistered: (result: LoginResponse) => void;
}

interface WebAuthnRegistrationFormState {
  name: string;
}

export const WebAuthnRegistrationForm = ({ onRegistered }: WebAuthnRegistrationFormProps) => {
  const { registerForm, register, state } = useForm<WebAuthnRegistrationFormState>({ name: '' });

  const [triggerWebAuthnGeneration, { result: generationOptions, loading: generationLoading, error: generationError }] = useAsyncHttp(({ post }) => {
    return post<PublicKeyCredentialCreationOptionsJSON>('/api/auth/web-authn/start-registration', {});
  }, []);

  const [triggerWebAuthnVerification, { result: verificationResult, loading: verificationLoading, error: verificationError }] = useAsyncHttp(({ post }, attn: RegistrationResponseJSON) => {
    return post<LoginResponse>('/api/auth/web-authn/verify-registration', {attn, name: state.name});
  }, [state.name]);

  const [doStartRegistration] = useAsync(async () => {
    let attResp: RegistrationResponseJSON;
    try {
      console.log('here', generationOptions);
      // Pass the options to the authenticator and wait for a response
      attResp = await startRegistration(generationOptions);
    } catch (error) {
      // Some basic error handling
      throw error;
    }

    triggerWebAuthnVerification(attResp);
  }, [generationOptions, triggerWebAuthnVerification]);

  useEffect(() => {
    if (generationOptions) doStartRegistration();
  }, [generationOptions]);

  useEffect(() => {
    if (verificationResult) onRegistered(verificationResult);
  }, [verificationResult]);

  return <LoginForm {...registerForm(triggerWebAuthnGeneration)}>
    <LoginInputEl {...register('name')} required placeholder='Device Name' />
    <LoginButton type="submit">Register Device</LoginButton>
  </LoginForm>
}
