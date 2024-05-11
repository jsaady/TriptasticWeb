import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const Root = lazy(() => import('./Root.js').then(module => ({ default: module.Root })));
const Home = lazy(() => import('./features/home/Home.js').then(module => ({ default: module.Home })));
const Login = lazy(() => import('./features/auth/Login.js').then(module => ({ default: module.Login })));
const WebAuthnDevices = lazy(() => import('./features/account/WebAuthnDevices.js').then(module => ({ default: module.WebAuthnDevices })));
const ForgotPasswordForm = lazy(() => import('./features/auth/ForgotPassword.js').then(module => ({ default: module.ForgotPasswordForm })));
const ResetPasswordForm = lazy(() => import('./features/auth/ResetPasswordForm.js').then(module => ({ default: module.ResetPasswordForm })));
const UpdatePasswordForm = lazy(() => import('./features/auth/UpdatePasswordForm.js').then(module => ({ default: module.UpdatePasswordForm })));
const VerifyEmailForm = lazy(() => import('./features/auth/VerifyEmail.js').then(module => ({ default: module.VerifyEmailForm })));
const WebAuthnLoginForm = lazy(() => import('./features/auth/WebAuthnLoginForm.js').then(module => ({ default: module.WebAuthnLoginForm })));
const Authenticated = lazy(() => import('./Authenticated.js').then(module => ({ default: module.Authenticated })));
const Account = lazy(() => import('./features/account/Account.js').then(module => ({ default: module.Account })));

export const router = createBrowserRouter([{
  path: '/',
  element: <Root />,
  children: [{
    path: 'login',
    element: <Login />,
    children: [{
      path: '',
      element: <WebAuthnLoginForm />
    }, {
      path: 'verify-email',
      element: <VerifyEmailForm />
    }, {
      path: 'update-password',
      element: <UpdatePasswordForm />
    }, {
      path: 'forgot-password',
      element: <ForgotPasswordForm />
    }, {
      path: 'reset-password',
      element: <ResetPasswordForm />
    }]
  }, {
    path: '',
    element: <Authenticated />,
    children: [{
      path: 'account/devices',
      element: <WebAuthnDevices />
    }, {
      path: 'account',
      element: <Account />
    }, {
      path: '',
      element: <Home />
    }]
  }],
}]);
