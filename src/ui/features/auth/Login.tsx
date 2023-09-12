import { useMemo } from 'react';
import { Button } from '../../components/Button.js';
import { Input } from '../../components/Input.js';
import { RegistrationFn, useForm } from '../../utils/forms.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { LoginState, useAuthorization } from '../../utils/useAuth.js';
import { LoginForm, LoginHeading, LogoutLink } from './LoginElements.js';
import { MFA } from './MFA.js';
import { LoginResponse } from './types.js';
import { useNavigate } from 'react-router';

interface LoginFormState {
  email: string;
  password: string;
  newPassword: string;
  emailToken?: string;
}

interface LoginFormProps {
  register: RegistrationFn<LoginFormState>;
  disabled: boolean;
}

const LoginFormElements = ({ register, disabled }: LoginFormProps) => {
  return <>
    <Input disabled={disabled} label='Email' {...register('email')} type="email" />
    <Input disabled={disabled} label='Password' {...register('password')} type="password" />
    <Button className="w-full my-6" type="submit">LOGIN</Button>
    {/* <Button type="button">REGISTER</Button> */}
  </>
};

const ResetPasswordElements = ({ register, disabled }: LoginFormProps) => {
  return <>
    <Input disabled={disabled} {...register('newPassword')} placeholder='New password' type='password' />
    <Button type="submit">SET PASSWORD</Button>
  </>
};


export const Login = () => {
  const { register, registerForm } = useForm<LoginFormState>();
  const { loginState, loggedIn, logout, setLoggedIn, handleLoginResponse, clientIdentifier } = useAuthorization();
  const navigate = useNavigate();

  const [handleLogin, { loading: loginLoading }] = useAsyncHttp(async ({ post }, state: LoginFormState) => {    
    const response = await post<LoginResponse>('/api/auth/login', {
      ...state,
      clientIdentifier
    });

    const success = handleLoginResponse(response);

    if (success) {
      navigate('/');
    }
  }, [setLoggedIn]);

  const [handleResetPassword, { loading: resetLoading }] = useAsyncHttp(async ({ post }, state: LoginFormState) => {    
    const response = await post<LoginResponse>('/api/auth/reset-password', {
      currentPassword: state.password,
      password: state.newPassword
    });

    handleLoginResponse(response);
  }, [setLoggedIn]);


  const { showPasswordReset, showUsernamePassword, showLoginMfa } = useMemo(() => ({
    showPasswordReset: loginState === LoginState.resetPassword,
    showRegisterMfa: loginState === LoginState.registerMfa,
    showLoginMfa: loginState === LoginState.loginMfa,
    showUsernamePassword: loginState === LoginState.login
  }), [loginState]);


  const handleSubmit = useMemo(() => {
    return showPasswordReset ? handleResetPassword : handleLogin;
  }, [loginState]);

  const loading = loginLoading || resetLoading;

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


  return <div className="max-w-lg mx-auto p-4 items-center bg-white top-10 relative">
    {!showUsernamePassword && <LogoutLink className='float-right' onClick={logout}>Log out</LogoutLink>}
    {heading && <LoginHeading>{heading}</LoginHeading>}
    {loggedIn && <p data-testid="login-success">Log in succeeded</p>}
    {(showUsernamePassword || showPasswordReset) && <LoginForm {...registerForm(handleSubmit)}>
      {showUsernamePassword ? LoginFormElements({ register, disabled: loading }) : ResetPasswordElements({ register, disabled: loading })}
    </LoginForm>}
    {showLoginMfa && <MFA onMFAComplete={handleLoginResponse} />}
  </div>
};
