import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';

interface AccessibleRouteProps {
  accesible: boolean; // Determina si la ruta es accesible
  path: string; // Ruta de la URL
  element: React.ReactElement; // Componente que se renderizará
  redirectPath?: string; // Ruta a la que redirige si no es accesible (opcional)
}

const AccessibleRoute: React.FC<AccessibleRouteProps> = ({
  accesible,
  path,
  element,
  redirectPath = '/login', // Redirige a /login por defecto si no es accesible
}) => {
  return (
    <Routes>  
        <Route
    path={path}
    element={accesible ? element : <Navigate to={redirectPath} replace />}
  />
  </Routes>

  );
};

export default AccessibleRoute;
