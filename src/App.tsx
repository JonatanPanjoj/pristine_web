import React, { useEffect } from 'react';
import { Navigation } from './route/Navigation';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store/store';
import { ThemeProvider } from "@material-tailwind/react";
import './i18n/infraestructure/i18n';
import { loadAndUpdateSedes } from './services/sedeStorage';
import { useSedeSync } from './hooks/useSedeSync';

function App() {
  
  useEffect(() => {
    // Cargar y actualizar sedes en localStorage al inicio de la aplicación
    loadAndUpdateSedes();
  }, []);
  useSedeSync();
  return (
    <div className="App font-sans">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <Navigation />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;
