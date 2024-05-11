import { Button } from '@ui/components/Button.js';
import { Input } from '@ui/components/Input.js';
import { useForm } from '@ui/utils/forms.js';
import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { useCallback, useState } from 'react';
import { LoginForm, LoginHeading, LogoutLink } from './LoginElements.js';
import { LoginResponse } from './types.js';


interface EmailFormState {
  emailToken: string;
}

export const VerifyEmailForm = () => {
  const { handleLoginResponse } = useAuthorization();
  const { register, registerForm } = useForm<EmailFormState>();
  const [sentEmail, setSentEmail] = useState(false);
  const [confirm, { loading: confirmLoading }] = useAsyncHttp(async ({ post }, { emailToken }: EmailFormState) => {
    const response = await post<LoginResponse>('/api/auth/verify-email', {
      token: emailToken
    });

    handleLoginResponse(response);
  }, []);
  const [sendVerificationEmail] = useAsyncHttp(({ post }, force = false) => post('/api/auth/send-verification-email', { force }), []);

  const send = useCallback(() => {
    setSentEmail(true);
    sendVerificationEmail(true);
  }, []);

  return <LoginForm {...registerForm(confirm)}>
    <LoginHeading className='mb-4'>Verify with email</LoginHeading>
    {sentEmail ? <>
      <Input className='mx-4' disabled={confirmLoading} {...register('emailToken')} placeholder='Verification token' />
      <Button className="m-4 w-full" type="submit">Verify</Button>
      <div className='my-4'>
        Didn't receive an email?&nbsp;<LogoutLink onClick={send}>Resend verification</LogoutLink>
      </div>
    </>
     : <Button className='mx-4 mb-4 w-full' onClick={send}>Send verification</Button>}
  </LoginForm>
};
