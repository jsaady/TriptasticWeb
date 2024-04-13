import { StrictMode } from 'react';
import ReactDOMClient from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './Router.js';
import { setupSW } from './register.js';
import { GlobalSocketProvider } from './utils/useSocket.js';
import { OpenStreetMap } from './utils/osm.js';
import { ModalProvider } from './utils/modals.js';

const root = ReactDOMClient.createRoot(document.getElementById('root')!);

  root.render(
  <ModalProvider>
    <GlobalSocketProvider>
      <OpenStreetMap>
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>
      </OpenStreetMap>
    </GlobalSocketProvider>
  </ModalProvider>
);
setupSW();
