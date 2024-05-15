import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import { Button } from '@ui/components/Button.js';
import { Clickable } from '@ui/components/Clickable.js';
import { Input } from '@ui/components/Input.js';
import { useForm } from '@ui/utils/forms.js';
import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBanner } from './Banner.js';
import { LoginForm } from './LoginElements.js';
import { LoginResponse } from './types.js';

export interface LoginFormState {
  username: string;
  email: string;
  password: string;
  registerDevice?: boolean;
}

export const WebAuthnLoginForm = () => {
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterLink, setShowRegisterLink] = useState(false);
  const { handleLoginResponse, clientIdentifier } = useAuthorization();

  const { register, registerForm, state } = useForm<LoginFormState>();

  const [startLogin, { loading, result }] = useAsyncHttp(async ({ post }, state: LoginFormState) => {
    const response = await post<{ status: string; challengeOptions: any }>('/api/auth/start', state);

    return response;
  }, []);

  const [doLogin, { loading: loginLoading, error: loginError }] = useAsyncHttp(async ({ post }, { username, challengeOptions }) => {
    let attResp: AuthenticationResponseJSON;
    
    try {
      attResp = await startAuthentication(result.challengeOptions);
    } catch (error) {
      setShowRegisterLink(true);
      console.error('Error on startAuthentication', error);
      // Some basic error handling
      throw error;
    }

    const body = {
      username,
      response: attResp,
      clientIdentifier
    }

    const response = await post<LoginResponse>('/api/auth/login', body);

    return handleLoginResponse(response);
  }, [result, clientIdentifier]);

  const [doRegister, { loading: registrationLoading, error: registrationError }] = useAsyncHttp(async ({ post }, state: LoginFormState) => {
    let attResp: RegistrationResponseJSON;
    try {
      // Pass the options to the authenticator and wait for a response
      attResp = await startRegistration(result.challengeOptions);
    } catch (error) {
      // Some basic error handling
      console.error('Error registering device', error);
      throw error;
    }

    const authResponse = await post<LoginResponse>(showEmail ? '/api/auth/register' : '/api/auth/register-device', {
      ...state,
      response: attResp,
      clientIdentifier
    });

    return handleLoginResponse(authResponse);
  }, [clientIdentifier, result]);

  useEffect(() => {
    if (!result?.status) return;

    switch (result.status) {
      case 'registerUser':
        setShowEmail(true);
        setShowPassword(true);
        break;
      case 'registerDevice':
        setShowEmail(false);
        setShowPassword(true);
        break;
      case 'login':
        doLogin({ username: state.username });
        break;
    }
  }, [result, state?.username]);

  const onSubmit = useCallback((state: LoginFormState) => {
    return (showEmail || showPassword) ? doRegister(state) : startLogin(state);
  }, [showEmail, showPassword, doRegister, startLogin]);

  const startDeviceRegistration = useCallback(() => {
    setShowRegisterLink(false);
    return startLogin({ username: state.username, email: '', password: '', registerDevice: true });
  }, [startLogin, state?.username]);


  const parsedError = useMemo(() => {
    const error = registrationError || loginError;

    if (!error?.responseText) {
      return null;
    }

    try {
      return JSON.parse(error.responseText);
    } catch (e) {
      return error.responseText;
    }
  }, [loginError, registrationError]);

  return <LoginForm className='flex flex-col' disabled={loginLoading || registrationLoading} {...registerForm(onSubmit)}>
    {parsedError && <ErrorBanner data-testid="login-error">{parsedError.message}</ErrorBanner>}
    <Input {...register('username')} required label='Username' type='text' />
    <div className={`flex flex-col w-full transition-all overflow-hidden ${showEmail ? '' : 'h-0'}`}>
        <Input {...register('email')} label='Email' type='email' />
    </div>
    <div className={`flex flex-col w-full transition-all overflow-hidden ${showPassword ? '' : 'h-0'}`}>
        <Input {...register('password')} label='Password' type={showPassword ? 'password' : 'hidden'} autoComplete={!showPassword ? 'false' : undefined} />
    </div>
    <Button className="w-full my-6" type="submit">{showEmail || showPassword ? 'REGISTER' : 'LOGIN'}</Button>
    {showRegisterLink && <div className='my-4'>
      Having trouble?&nbsp;<Clickable className='mt-2 cursor-pointer text-blue-400' onClick={startDeviceRegistration}>Register this device</Clickable>
    </div>}
    {!showRegisterLink && showPassword && !showEmail && <div className='my-4'>
    Forgot your password?&nbsp;<Link className='mt-2 cursor-pointer text-blue-400' to='/login/forgot-password'>Reset password</Link>
    </div>}
    <div>
      <a className='text-blue-400' href="/assets/privacy.html" target="_blank">Privacy Policy</a>
    </div>
  </LoginForm>
}
