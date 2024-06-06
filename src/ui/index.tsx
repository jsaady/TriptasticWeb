import { StrictMode, Suspense } from 'react';
import ReactDOMClient from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './Router.js';
import { setupSW } from './register.js';
import { GlobalSocketProvider } from './utils/useSocket.js';
import { ModalProvider } from './utils/modals.js';
import { AlertProvider } from './utils/alerts.js';

const root = ReactDOMClient.createRoot(document.getElementById('root')!);

root.render(
  <Suspense fallback={<div>Loading...</div>}>
    <ModalProvider>
      <GlobalSocketProvider>
        <StrictMode>
          <AlertProvider>
            <RouterProvider router={router} />
          </AlertProvider>
        </StrictMode>
      </GlobalSocketProvider>
    </ModalProvider>
  </Suspense>
);
setupSW();
