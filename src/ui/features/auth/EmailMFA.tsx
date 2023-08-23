import { useCallback, useEffect } from 'react';
import { useForm } from '../../utils/forms.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { LoginButtonEl, LoginFormEl, LoginHeading, LoginInputEl } from './LoginElements.js';
import { LoginResponse } from './types.js';

export interface EmailMFAProps {
  onEmailConfirmed: (resp: LoginResponse) => void;
}

interface EmailFormState {
  emailToken: string;
}

export const EmailMFAPage = ({ onEmailConfirmed }: EmailMFAProps) => {
  const { register, registerForm } = useForm<EmailFormState>();
  const [confirm, { loading: confirmLoading }] = useAsyncHttp(async ({ post }, { emailToken }: EmailFormState) => {
    const response = await post<LoginResponse>('/api/auth/verify-email', {
      token: emailToken
    });

    onEmailConfirmed(response);
  }, []);
  const [sendVerificationEmail] = useAsyncHttp(({ post }, force = false) => post('/api/auth/send-verification-email', { force }), []);

  const resend = useCallback(() => {
    sendVerificationEmail(true);
  }, []);

  useEffect(() => {
    sendVerificationEmail();
  }, []);

  return <LoginFormEl {...registerForm(confirm)}>
    <LoginHeading>Verify with email</LoginHeading>
    <LoginInputEl disabled={confirmLoading} {...register('emailToken')} placeholder='Verification token' />
    <LoginButtonEl onClick={resend}>Resend verification</LoginButtonEl>
    <LoginButtonEl type="submit">Verify</LoginButtonEl>
  </LoginFormEl>
};
