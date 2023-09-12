import { createBrowserRouter } from 'react-router-dom';
import { Root } from './Root.js';
import { Login } from './features/auth/Login.js';
import { Authenticated } from './Authenticated.js';
import { WebAuthnDevices } from './features/account/WebAuthnDevices.js';
import { Home } from './features/home/Home.js';
import { Account } from './features/account/Account.js';
import { UsernamePasswordForm } from './features/auth/UsernamePasswordForm.js';
import { UpdatePasswordForm } from './features/auth/UpdatePasswordForm.js';
import { ResetPasswordForm } from './features/auth/ResetPasswordForm.js';
import { MFA } from './features/auth/MFA.js';
import { ForgotPasswordForm } from './features/auth/ForgotPassword.js';

export const router = createBrowserRouter([{
  path: '/',
  element: <Root />,
  children: [{
    path: 'login',
    element: <Login />,
    children: [{
      path: '',
      element: <UsernamePasswordForm />
    }, {
      path: 'update-password',
      element: <UpdatePasswordForm />
    }, {
      path: 'forgot-password',
      element: <ForgotPasswordForm />
    }, {
      path: 'reset-password',
      element: <ResetPasswordForm />
    }, {
      path: 'mfa',
      element: <MFA />
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
