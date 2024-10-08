import { Button } from '@ui/components/Button.js';
import { Input } from '@ui/components/Input.js';
import { useForm } from '@ui/utils/forms.js';
import { FetchError } from '@ui/utils/http.js';
import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { ErrorBanner } from './Banner.js';
import { LoginForm } from './LoginElements.js';
import { LoginResponse } from './types.js';

export interface UpdatePasswordFormProps {
  onSubmit?: () => void;
}
export interface UpdatePasswordFormState {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

export const UpdatePasswordForm = ({ onSubmit }: UpdatePasswordFormProps) => {
  const { register, registerForm } = useForm<UpdatePasswordFormState>();
  const { setLoggedIn, handleLoginResponse } = useAuthorization();

  const [handleUpdatePassword, { loading, error }] = useAsyncHttp(async ({ post }, state: UpdatePasswordFormState) => {    
    try {
      const response = await post<LoginResponse>('/api/auth/update-password', {
        currentPassword: state.password,
        password: state.newPassword
      });
  
      handleLoginResponse(response);
      onSubmit?.();
    } catch (e) {
      const err = e as FetchError;
      const errorMessage = await err.response.json();
      throw new Error(errorMessage.message);
    }

  }, [setLoggedIn]);

  return <LoginForm {...registerForm(handleUpdatePassword)}>
    {error && <ErrorBanner>{error.message}</ErrorBanner>}
    <Input disabled={loading} label='Current Password' {...register('password', { required: true })} type="password" />
    <Input disabled={loading} label='New Password' {...register('newPassword', { required: true })} type="password" />
    <Input disabled={loading} {...register('confirmPassword', (v, s) => v !== s.newPassword && 'Passwords must match')} label='Confirm password' type='password' />
    <Button className="w-full my-6" type="submit">SET PASSWORD</Button>
  </LoginForm>
};