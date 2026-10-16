// views/ChecklistView.tsx
// El ChecklistDashboard ahora aporta su propia cabecera (banda oscura),
// fondo (surface-app) y padding, por lo que esta vista solo lo monta.
// Se elimina la cabecera/card anterior para no duplicar títulos.

import React from 'react';
import ChecklistDashboard from '../components/ChecklistDashboard';

const ChecklistView: React.FC = () => {
  return <ChecklistDashboard />;
};

export default ChecklistView;