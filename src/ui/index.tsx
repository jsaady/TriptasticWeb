import { StrictMode } from 'react';
import ReactDOMClient from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './Router.js';
import { setupSW } from './register.js';
import { GlobalSocketProvider } from './utils/useSocket.js';

const root = ReactDOMClient.createRoot(document.getElementById('root')!);

  root.render(
<GlobalSocketProvider>
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
</GlobalSocketProvider>
);
setupSW();
