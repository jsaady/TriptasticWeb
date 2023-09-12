import { Button } from '../../components/Button.js';
import { Input } from '../../components/Input.js';
import { useForm } from '../../utils/forms.js';
import { FetchError } from '../../utils/http.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { useAuthorization } from '../../utils/useAuth.js';
import { ErrorText, LoginForm } from './LoginElements.js';
import { LoginResponse } from './types.js';

export interface ResetPasswordFormProps {
  onSubmit?: () => void;
}
export interface ResetPasswordFormState {
  password: string;
  newPassword: string;
  confirmPassword: string;
}
export const ResetPasswordForm = ({ onSubmit }: ResetPasswordFormProps) => {
  const { register, registerForm } = useForm<ResetPasswordFormState>();
  const { setLoggedIn, handleLoginResponse } = useAuthorization();


  const [handleResetPassword, { loading, error }] = useAsyncHttp(async ({ post }, state: ResetPasswordFormState) => {    
    try {
      const response = await post<LoginResponse>('/api/auth/reset-password', {
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

  return <LoginForm {...registerForm(handleResetPassword)}>
    {error && <ErrorText>{error.message}</ErrorText>}
    <Input disabled={loading} label='Current Password' {...register('password', { required: true })} type="password" />
    <Input disabled={loading} label='New Password' {...register('newPassword', { required: true })} type="password" />
    <Input disabled={loading} {...register('confirmPassword', (v, s) => v !== s.newPassword && 'Passwords must match')} label='Confirm password' type='password' />
    <Button className="w-full my-6" type="submit">SET PASSWORD</Button>
  </LoginForm>
};
