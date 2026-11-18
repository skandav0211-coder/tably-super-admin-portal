import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource-variable/nunito';
import '@fontsource-variable/fredoka';
import App from './App';
import { UiProvider } from './ui';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><HashRouter><UiProvider><App /></UiProvider></HashRouter></React.StrictMode>);
