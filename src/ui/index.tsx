import ReactDOMClient from 'react-dom/client';
import App from './App.js';
import { setupSW } from './register.js';

const Root = ReactDOMClient.createRoot(document.getElementById('root')!);

Root.render(<App />);
setupSW();
