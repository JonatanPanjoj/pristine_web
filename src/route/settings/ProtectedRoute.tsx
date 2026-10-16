import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../../store/store'; // Ajusta la ruta según tu estructura

const ProtectedRoute: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user); // Verifica si el usuario está en el Redux

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;