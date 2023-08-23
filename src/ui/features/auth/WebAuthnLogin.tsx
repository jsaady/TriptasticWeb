import { startAuthentication } from '@simplewebauthn/browser';
import { AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/typescript-types';
import { useEffect } from 'react';
import { useAsync, useAsyncHttp } from '../../utils/useAsync.js';
import { LoginButtonEl, LoginHeading } from './LoginElements.js';
import { LoginResponse } from './types.js';

export interface WebAuthnLoginFormProps {
  onLoggedIn: (result: LoginResponse) => void;
}

export const WebAuthnLoginForm = ({ onLoggedIn }: WebAuthnLoginFormProps) => {
  const [triggerWebAuthnLogin, { result: loginOptions, loading: loginStartLoading, error: loginStartError }] = useAsyncHttp(({ post }) => {
    return post<PublicKeyCredentialRequestOptionsJSON>('/api/auth/web-authn/login-start', {});
  }, []);
  const [triggerVerifyWebAuthnLogin, { result: loginVerifyResult, loading: verifyLoginLoading, error: verifyLoginError }] = useAsyncHttp(({ post }, opts: AuthenticationResponseJSON) => {
    return post<LoginResponse>('/api/auth/web-authn/verify-login', opts);
  }, []);

  const [doStartLogin] = useAsync(async () => {
    let attResp: AuthenticationResponseJSON;
    try {
      attResp = await startAuthentication(loginOptions);
    } catch (error) {
      // Some basic error handling
      throw error;
    }

    triggerVerifyWebAuthnLogin(attResp);
  }, [loginOptions]);

  useEffect(() => {
    if (loginOptions) doStartLogin();
  }, [loginOptions]);

  useEffect(() => {
    console.log('verify result', loginVerifyResult);
    if (loginVerifyResult) onLoggedIn(loginVerifyResult)
  }, [loginVerifyResult]);

  return <>
    <LoginHeading>Verify with device</LoginHeading>
    <LoginButtonEl onClick={triggerWebAuthnLogin}>Login with device</LoginButtonEl>
  </>
}