import { StrictMode, Suspense } from 'react';
import ReactDOMClient from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './Router.js';
import { setupSW } from './register.js';
import { GlobalSocketProvider } from './utils/useSocket.js';
import { ModalProvider } from './utils/modals.js';

const root = ReactDOMClient.createRoot(document.getElementById('root')!);

root.render(
  <Suspense fallback={<div>Loading...</div>}>
    <ModalProvider>
      <GlobalSocketProvider>
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>
      </GlobalSocketProvider>
    </ModalProvider>
  </Suspense>
);
setupSW();
