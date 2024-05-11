
import { Button } from '@ui/components/Button.js';
import { Input } from '@ui/components/Input.js';
import { useForm } from '@ui/utils/forms.js';
import { FetchError } from '@ui/utils/http.js';
import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { useSearchParams } from 'react-router-dom';
import { ErrorBanner } from './Banner.js';
import { LoginForm } from './LoginElements.js';
import { LoginResponse } from './types.js';

export interface ResetPasswordFormProps {
  onSubmit?: () => void;
}
export interface ResetPasswordFormState {
  newPassword: string;
  confirmPassword: string;
}
export const ResetPasswordForm = ({ onSubmit }: ResetPasswordFormProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { register, registerForm } = useForm<ResetPasswordFormState>();
  const { setLoggedIn, handleLoginResponse, clientIdentifier } = useAuthorization();

  const [handleResetPassword, { loading, error }] = useAsyncHttp(async ({ post }, state: ResetPasswordFormState) => {    
    try {
      const response = await post<LoginResponse>('/api/auth/reset-password', {
        token: searchParams.get('rpt'),
        password: state.newPassword,
        clientIdentifier
      });
  
      searchParams.delete('rpt');
      setSearchParams(searchParams);

      handleLoginResponse(response);
      onSubmit?.();
    } catch (e) {
      const err = e as FetchError;
      const errorMessage = await err.response.json();
      throw new Error(errorMessage.message);
    }

  }, [setLoggedIn]);

  return <LoginForm {...registerForm(handleResetPassword)}>
    {error && <ErrorBanner>{error.message}</ErrorBanner>}
    <Input disabled={loading} label='New Password' {...register('newPassword', { required: true })} type="password" />
    <Input disabled={loading} {...register('confirmPassword', (v, s) => v !== s.newPassword && 'Passwords must match')} label='Confirm password' type='password' />
    <Button className="w-full my-6" type="submit">SET PASSWORD</Button>
  </LoginForm>
};
