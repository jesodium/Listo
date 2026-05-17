import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './components/AppProvider';
import App from './App';
import 'flag-icons/css/flag-icons.min.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
