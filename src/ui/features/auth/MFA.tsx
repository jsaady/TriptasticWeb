import { EmailMFAPage } from './EmailMFA.js';
import { LoginFormSeparator } from './LoginElements.js';
import { WebAuthnLoginForm } from './WebAuthnLogin.js';
import { LoginResponse } from './types.js';

export const MFA = () => {
  return <>
    <EmailMFAPage />
    <LoginFormSeparator/>
    <WebAuthnLoginForm />
  </>
};
