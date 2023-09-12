import { startAuthentication } from '@simplewebauthn/browser';
import { AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/typescript-types';
import { useEffect } from 'react';
import { Button } from '../../components/Button.js';
import { useAsync, useAsyncHttp } from '../../utils/useAsync.js';
import { useAuthorization } from '../../utils/useAuth.js';
import { LoginHeading } from './LoginElements.js';
import { LoginResponse } from './types.js';

export const WebAuthnLoginForm = () => {
  const { handleLoginResponse } = useAuthorization();

  const [triggerWebAuthnLogin, { result: loginOptions, loading: loginStartLoading, error: loginStartError }] = useAsyncHttp(({ post }) => {
    return post<PublicKeyCredentialRequestOptionsJSON>('/api/auth/web-authn/login-start', {});
  }, []);
  const [triggerVerifyWebAuthnLogin, { result: loginVerifyResult, loading: verifyLoginLoading, error: verifyLoginError }] = useAsyncHttp(async ({ post }, opts: AuthenticationResponseJSON) => {
    const response = await post<LoginResponse>('/api/auth/web-authn/verify-login', opts);

    handleLoginResponse(response);
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

  return <div className='w-full flex flex-wrap items-center justify-center'>
    <LoginHeading>Verify with device</LoginHeading>
    <Button className='mx-4 mb-4 w-full' onClick={triggerWebAuthnLogin}>Login with device</Button>
  </div>
}