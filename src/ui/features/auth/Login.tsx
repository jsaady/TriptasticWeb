import { useEffect, useMemo } from 'react';
import { RegistrationFn, useForm } from '../../utils/forms.js';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { LoginState, useAuthorization } from '../../utils/useAuth.js';
import { EmailMFAPage } from './EmailMFA.js';
import { LoginButtonEl, LoginFormEl, LoginHeading, LoginInputEl, LoginLink, LoginWrapperEl } from './LoginElements.js';
import { MFA } from './MFA.js';
import { LoginResponse } from './types.js';

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
    <LoginInputEl disabled={disabled}  {...register('email')} placeholder='Email' type="email" />
    <LoginInputEl disabled={disabled} {...register('password')} placeholder='Password' type="password" />
    <LoginButtonEl type="submit">LOGIN</LoginButtonEl>
    <LoginButtonEl type="button">REGISTER</LoginButtonEl>
  </>
};

const ResetPasswordElements = ({ register, disabled }: LoginFormProps) => {
  return <>
    <LoginInputEl disabled={disabled} {...register('newPassword')} placeholder='New password' type='password' />
    <LoginButtonEl type="submit">SET PASSWORD</LoginButtonEl>
  </>
};


export const Login = () => {
  const { register, registerForm } = useForm<LoginFormState>();
  const { loginState, loggedIn, logout, setLoggedIn, handleLoginResponse } = useAuthorization();

  const [sendVerificationEmail] = useAsyncHttp(({ post }) => post('/api/auth/send-verification-email', {}), []);

  const [handleLogin, { loading: loginLoading }] = useAsyncHttp(async ({ post }, state: LoginFormState) => {    
    const response = await post<LoginResponse>('/api/auth/login', {
      ...state
    });

    handleLoginResponse(response);
  }, [setLoggedIn]);

  const [handleResetPassword, { loading: resetLoading }] = useAsyncHttp(async ({ post }, state: LoginFormState) => {    
    const response = await post<LoginResponse>('/api/auth/reset-password', {
      currentPassword: state.password,
      password: state.newPassword
    });

    handleLoginResponse(response);
  }, [setLoggedIn]);


  const { showPasswordReset, showVerifyEmail, showUsernamePassword, showLoginMfa } = useMemo(() => ({
    showPasswordReset: loginState === LoginState.resetPassword,
    showVerifyEmail: loginState === LoginState.verifyEmail,
    showRegisterMfa: loginState === LoginState.registerMfa,
    showLoginMfa: loginState === LoginState.loginMfa,
    showUsernamePassword: loginState === LoginState.login
  }), [loginState]);

  useEffect(() => {
    if (showVerifyEmail) sendVerificationEmail();
  }, [showVerifyEmail]);


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


  return <LoginWrapperEl>
    {!showUsernamePassword && <LoginLink onClick={logout}>Log out</LoginLink>}
    {heading && <LoginHeading>{heading}</LoginHeading>}
    {loggedIn && <p data-testid="login-success">Log in succeeded</p>}
    {(showUsernamePassword || showPasswordReset) && <LoginFormEl {...registerForm(handleSubmit)}>
      {showUsernamePassword ? LoginFormElements({ register, disabled: loading }) : ResetPasswordElements({ register, disabled: loading })}
    </LoginFormEl>}
    {showLoginMfa && <MFA onMFAComplete={handleLoginResponse} />}
    {showVerifyEmail && <EmailMFAPage onEmailConfirmed={handleLoginResponse} />}
  </LoginWrapperEl>
};
