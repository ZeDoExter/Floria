import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useAuthStore } from './stores/authStore';

// Initialize auth store before rendering
function AppInitializer() {
  useEffect(() => {
    // Load stored authentication on mount
    useAuthStore.getState().loadStored();
  }, []);

  return <App />;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppInitializer />
    </BrowserRouter>
  </React.StrictMode>
);
