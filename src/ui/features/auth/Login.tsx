import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/Button.js';
import { Input } from '../../components/Input.js';
import { useForm } from '../../utils/forms.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { LoginState, useAuthorization } from '../../utils/useAuth.js';
import { LoginForm, LoginHeading, LogoutLink } from './LoginElements.js';
import { MFA } from './MFA.js';
import { ResetPasswordForm } from './ResetPasswordForm.js';
import { LoginResponse } from './types.js';

export interface LoginFormState {
  email: string;
  password: string;
  emailToken?: string;
}

export const Login = () => {
  const { loginState, loggedIn, logout, handleLoginResponse } = useAuthorization();

  const { showPasswordReset, showUsernamePassword, showLoginMfa } = useMemo(() => ({
    showPasswordReset: loginState === LoginState.resetPassword,
    showRegisterMfa: loginState === LoginState.registerMfa,
    showLoginMfa: loginState === LoginState.loginMfa,
    showUsernamePassword: loginState === LoginState.login
  }), [loginState]);


  const heading = useMemo(() => {
    switch(loginState) {
      case LoginState.resetPassword:
        return 'You must reset your password to continue';
      case LoginState.verifyEmail:
        return 'You must verify your email to continue';
      case LoginState.registerMfa:
        return 'You must register a device';
      case LoginState.loginMfa:
        return '';
      case LoginState.login:
      default:
        return 'You must log in to continue';
    }
  }, [loginState]);

  return <div className="max-w-lg mx-auto p-4 items-center bg-white top-10 relativ dark:bg-inherit">
    {!showUsernamePassword && <LogoutLink className='float-right' onClick={logout}>Log out</LogoutLink>}
    {heading && <LoginHeading>{heading}</LoginHeading>}
    {loggedIn && <p data-testid="login-success">Log in succeeded</p>}
    {showUsernamePassword && <UsernamePasswordForm />}
    {showPasswordReset && <ResetPasswordForm />}
    {showLoginMfa && <MFA onMFAComplete={handleLoginResponse} />}
  </div>
};


const UsernamePasswordForm = () => {
  const { register, registerForm } = useForm<LoginFormState>();
  const { setLoggedIn, handleLoginResponse, clientIdentifier } = useAuthorization();
  const navigate = useNavigate();

  const [handleLogin, { loading }] = useAsyncHttp(async ({ post }, state: LoginFormState) => {    
    const response = await post<LoginResponse>('/api/auth/login', {
      ...state,
      clientIdentifier
    });

    const success = handleLoginResponse(response);

    if (success) {
      navigate('/');
    }
  }, [setLoggedIn]);

  return <LoginForm {...registerForm(handleLogin)}>
    <Input disabled={loading} label='Email' {...register('email')} type="email" />
    <Input disabled={loading} label='Password' {...register('password')} type="password" />
    <Button className="w-full my-6" type="submit">LOGIN</Button>
  </LoginForm>;
}

