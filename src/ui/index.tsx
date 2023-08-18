import React from 'react';
import ReactDOMClient from 'react-dom/client';
import App from './App.js';

const Root = ReactDOMClient.createRoot(document.getElementById('root')!);

Root.render(<App />);
