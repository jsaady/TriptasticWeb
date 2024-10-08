import { Button } from '@ui/components/Button.js';
import { Input } from '@ui/components/Input.js';
import { useForm } from '@ui/utils/forms.js';
import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { useState } from 'react';
import { SuccessBanner } from './Banner.js';
import { LoginForm } from './LoginElements.js';

interface ForgotPasswordFormState {
  email: string;
}

export const ForgotPasswordForm = () => {
  const { register, registerForm } = useForm<ForgotPasswordFormState>();

  const [successMessage, setSuccessMessage] = useState<string>();

  const [handleForgotPassword] = useAsyncHttp(async ({ post }, state: ForgotPasswordFormState) => { 
    await post('/api/auth/send-reset-password-email', state);
    setSuccessMessage('Password reset email sent, please check your inbox.');
  }, []);

  return <LoginForm {...registerForm(handleForgotPassword)}>
    {successMessage && <SuccessBanner>{successMessage}</SuccessBanner>}
    <Input label='Email' {...register('email')} type="email" />
    <Button className="w-full my-6" type="submit">SEND RESET PASSWORD EMAIL</Button>
  </LoginForm>
};
