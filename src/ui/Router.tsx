import { Navigate, createBrowserRouter } from 'react-router-dom';
import { Authenticated } from './Authenticated.js';
import { Root } from './Root.js';
import { Account } from './features/account/Account.js';
import { WebAuthnDevices } from './features/account/WebAuthnDevices.js';
import { ForgotPasswordForm } from './features/auth/ForgotPassword.js';
import { Login } from './features/auth/Login.js';
import { ResetPasswordForm } from './features/auth/ResetPasswordForm.js';
import { UpdatePasswordForm } from './features/auth/UpdatePasswordForm.js';
import { VerifyEmailForm } from './features/auth/VerifyEmail.js';
import { WebAuthnLoginForm } from './features/auth/WebAuthnLoginForm.js';
import { Home } from './features/home/Home.js';
import { Notes } from './features/notes/Notes.js';

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
      element: <Navigate to='/notes' />
    }, {
      path: 'notes',
      element: <Notes />
    }]
  }],
}]);
