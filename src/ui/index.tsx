import { StrictMode } from 'react';
import ReactDOMClient from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './Router.js';
import { setupSW } from './register.js';

const root = ReactDOMClient.createRoot(document.getElementById('root')!);

root.render(<StrictMode>
  <RouterProvider router={router} />
</StrictMode>);
setupSW();
