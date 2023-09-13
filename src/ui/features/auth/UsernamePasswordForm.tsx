import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button.js';
import { Input } from '../../components/Input.js';
import { useForm } from '../../utils/forms.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { useAuthorization } from '../../utils/useAuth.js';
import { ErrorBanner, SuccessBanner } from './Banner.js';
import { LoginFormState } from './Login.js';
import { LoginForm } from './LoginElements.js';
import { LoginResponse } from './types.js';

export const UsernamePasswordForm = () => {
  const { register, registerForm } = useForm<LoginFormState>();
  const { handleLoginResponse, clientIdentifier } = useAuthorization();
  const navigate = useNavigate();
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [handleLogin, { loading, error }] = useAsyncHttp(async ({ post }, state: LoginFormState) => {
    const response = await post<LoginResponse>('/api/auth/login', {
      ...state,
      clientIdentifier
    });

    const success = handleLoginResponse(response);

    setLoginSuccess(success);

    if (success) {
      navigate('/');
    }
  }, []);

  const loginError = useMemo(() => {
    if (!error?.responseText) {
      return null;
    }

    try {
      return JSON.parse(error.responseText);
    } catch (e) {
      return error.responseText;
    }
  }, [error]);

  return <LoginForm {...registerForm(handleLogin)}>
    {loginError && <ErrorBanner data-testid="login-error">{loginError.message}</ErrorBanner>}
    {loginSuccess && <SuccessBanner data-testid="login-success">Logged in</SuccessBanner>}
    <Input disabled={loading} label='Email' {...register('email')} type="email" />
    <Input disabled={loading} label='Password' {...register('password')} type="password" />
    <Button className="w-full my-6" type="submit">LOGIN</Button>
    <div className='my-4'>
      Forgot your password?&nbsp;<Link className='mt-2 cursor-pointer text-blue-400' to='/login/forgot-password'>Reset password</Link>
    </div>
  </LoginForm>;
};
