import { EmailMFAPage } from './EmailMFA.js';
import { LoginFormSeparator } from './LoginElements.js';
import { WebAuthnLoginForm } from './WebAuthnLogin.js';
import { LoginResponse } from './types.js';

export interface MFAProps {
  onMFAComplete: (resp: LoginResponse) => void;
}

export const MFA = ({ onMFAComplete }: MFAProps) => {
  return <>
    <EmailMFAPage onEmailConfirmed={onMFAComplete} />
    <LoginFormSeparator/>
    <WebAuthnLoginForm onLoggedIn={onMFAComplete} />
  </>
};
