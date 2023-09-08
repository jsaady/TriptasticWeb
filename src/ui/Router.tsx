import { createBrowserRouter } from 'react-router-dom';
import { Root } from './Root.js';
import { Login } from './features/auth/Login.js';
import { Authenticated } from './Authenticated.js';
import { WebAuthnDevices } from './features/account/WebAuthnDevices.js';

export const router = createBrowserRouter([{
  path: '/',
  element: <Root />,
  children: [{
    path: 'login',
    element: <Login />,
  }, {
    path: '',
    element: <Authenticated />,
    children: [{
      path: 'devices',
      element: <WebAuthnDevices />
    }]
  }],
}]);
