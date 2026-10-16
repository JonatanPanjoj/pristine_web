import React from 'react';

// Definición de tipos para las props
interface PermissionsProps {
  selectedKeys: string[];
}

const PermissionsModule: React.FC<PermissionsProps> = ({ selectedKeys }) => {
  // Definición estática de los módulos y submódulos
  const modules = [
    {
      groupId: 1,
      groupName: 'Módulo de Administración del Sistema',
      subModules: [
        { id: 1, name: 'Gestor de usuarios', key: 'GUSU', description: 'Permisos para gestionar usuarios.' },
        { id: 2, name: 'Reporte de Usuarios (PDF y EXCEL)', key: 'REPUSU', description: 'Permisos para generar reportes de usuarios.' },
        { id: 3, name: 'Gestor de Grupos de Permisos', key: 'GRUPPERM', description: 'Permisos para gestionar grupos de permisos.' },
        { id: 4, name: 'Gestor de Permisos', key: 'GPERM', description: 'Permisos para gestionar permisos.' },
        { id: 5, name: 'Gestor de Roles', key: 'NEWROL', description: 'Permisos para gestionar roles.' },
        { id: 6, name: 'Asignación de Roles a cada Usuario', key: 'ASIROL', description: 'Permisos para asignar roles a usuarios.' },
        { id: 7, name: 'Asignación de Usuarios a Sedes', key: 'USUSED', description: 'Permisos para asignar usuarios a sedes.' },
        { id: 8, name: 'Asignación de Usuarios a Categorías del CheckList', key: 'USUCAT', description: 'Permisos para asignar usuarios a categorías del checklist.' },
      ]
    },
    {
      groupId: 2,
      groupName: 'Módulo de Inicio',
      subModules: [
        { id: 1, name: 'Actualización de Información de Usuario (MI PERFIL)', key: 'PERFIL', description: 'Permisos para actualizar la información del perfil de usuario.' },
        { id: 2, name: 'Cambio de Contraseña', key: 'PERFIL', description: 'Permisos para cambiar la contraseña de usuario.' },
        { id: 3, name: 'Cambio de Pregunta Secreta', key: 'PERFIL', description: 'Permisos para cambiar la pregunta secreta de usuario.' },
      ]
    },
    {
      groupId: 3,
      groupName: 'Módulo de Gestores Técnicos',
      subModules: [
        { id: 1, name: 'Gestor de Sedes', key: 'GETSE', description: 'Permisos para gestionar sedes.' },
        { id: 2, name: 'Gestor de Sector / Torre', key: 'GESTA', description: 'Permisos para gestionar sectores y torres.' },
        { id: 3, name: 'Gestor de Áreas', key: 'GETAR', description: 'Permisos para gestionar áreas.' },
        { id: 4, name: 'Categorías (Check List)', key: 'CATCHK', description: 'Permisos para gestionar categorías del check list.' },
        { id: 5, name: 'Categorías (Help Desk)', key: 'CATHD', description: 'Permisos para gestionar categorías del help desk.' },
        { id: 6, name: 'Categorías (Auditoría)', key: 'CATAUDIT', description: 'Permisos para gestionar categorías de auditoría.' },
        { id: 7, name: 'Categorías (PPM)', key: 'CATPPM', description: 'Permisos para gestionar categorías del PPM.' },
        { id: 8, name: 'Generador de QR', key: 'GENQR', description: 'Permisos para generar códigos QR.' },
        { id: 9, name: 'Reportes Automáticos', key: 'REPAUTO', description: 'Permisos para configurar el envío automático de reportes por correo.' },
      ]
    },
    {
      groupId: 4,
      groupName: 'Módulo de Check List',
      subModules: [
        { id: 1, name: 'Gestor de Check List', key: 'GESCHK', description: 'Permisos para gestionar check list.' },
        { id: 2, name: 'Gestor de Preguntas', key: 'GESTPREG', description: 'Permisos para gestionar preguntas.' },
        { id: 3, name: 'Gestor de Horarios de Revisión', key: 'GESTHOR', description: 'Permisos para gestionar horarios de revisión.' },
        { id: 4, name: 'Registro de Revisión Web', key: 'REGREVWEB', description: 'Permisos para registrar revisiones en la web.' },
        { id: 5, name: 'Revisión y Resultados', key: 'REVRESULT', description: 'Permisos para revisar y ver resultados.' },
        { id: 6, name: 'Reportes de CheckList', key: 'REPCHK', description: 'Permisos para generar reportes de checklist.' },
      ]
    },
    {
      groupId: 5,
      groupName: 'Módulo de Help Desk',
      subModules: [
        { id: 1, name: 'Gestor de Prioridades', key: 'GESTPRIO', description: 'Permisos para gestionar prioridades.' },
        { id: 2, name: 'Gestor de Status', key: 'GESTSTATUS', description: 'Permisos para gestionar status.' },
        { id: 3, name: 'Gestor de Tipos de Incidentes', key: 'GESTIPOINC', description: 'Permisos para gestionar tipos de incidentes.' },
        { id: 4, name: 'Aperturar Ticket', key: 'NEWTICKET', description: 'Permisos para abrir tickets.' },
        { id: 5, name: 'Tramitar Tickets Asignados', key: 'GESTTICKET', description: 'Permisos para tramitar tickets asignados.' },
        { id: 6, name: 'Cerrar Tickets', key: 'CLOSETICKET', description: 'Permisos para cerrar tickets.' },
        { id: 7, name: 'Reportes de HelpDesk', key: 'REPHD', description: 'Permisos para generar reportes de helpdesk.' },
      ]
    },
    {
      groupId: 6,
      groupName: 'Módulo de Auditoría',
      subModules: [
        { id: 1, name: 'Permisos Generales del Módulo', key: 'GESTAUDIT', description: 'Permisos generales del módulo de auditoría.' },
        { id: 2, name: 'Permiso para programar', key: 'AUDITPRO', description: 'Permisos para programar auditorías.' },
        { id: 3, name: 'Seguimiento al reporte dependiendo de los permisos de Categoría y departamento', key: 'AUDITREP', description: 'Permisos para seguimiento de reportes según categoría y departamento.' },
        { id: 4, name: 'Seguimiento del plan de acción dependiendo de los permisos de Categorías y Departamentos', key: 'AUDITPLAN', description: 'Permisos para seguimiento del plan de acción según categorías y departamentos.' },
        { id: 5, name: 'Lectura de reporte del plan de acción dependiendo permisos de Categoría y departamento', key: 'AUDITPLANR', description: 'Permisos para lectura del plan de acción según categoría y departamento.' },
        { id: 6, name: 'Revisión de resultados de Auditorías dependiendo de los permisos de Categoría y Departamento', key: 'AUDITRESUL', description: 'Permisos para revisión de resultados de auditorías según categoría y departamento.' },
        { id: 7, name: 'Permiso a ver el tablero dependiendo de las categorías y departamentos', key: 'AUDITGRAFI', description: 'Permisos para ver el tablero según categorías y departamentos.' },
        { id: 8, name: 'Permiso para ver la pantalla realizar la auditoría y ejecutarlas, también se verán las auditorías desde la app', key: 'AUDITREAUD', description: 'Permisos para ejecutar auditorías desde la app.' },
        { id: 9, name: 'Permiso de configuración de correos', key: 'AUDITMAIL', description: 'Permisos para configurar correos.' },
        { id: 10, name: 'Auditoría Gráficos', key: 'AUDITGRAFI', description: 'Permisos para ver gráficos de auditoría.' },
        { id: 11, name: 'Reportes de Auditoría', key: 'REPAUDIT', description: 'Permisos para generar reportes de auditoría.' },
      ]
    },
    {
      groupId: 7,
      groupName: 'Módulo PPM (Mantenimiento)',
      subModules: [
        { id: 1, name: 'Permisos Generales del Módulo', key: 'GESTPPM', description: 'Permisos generales del módulo de PPM.' },
      ]
    },
  ];

  // Función para verificar si un submódulo está seleccionado
  const isSelected = (key: string) => selectedKeys.includes(key);

  return (
    <div className="permissions-module space-y-6">
                                <h1 className=" font-semibold mb-4">Permisos Asignados</h1>

      {modules.map((module) => (
        
        <div key={module.groupId} className="module">
            
                        <h2 className="text-sm font-semibold mb-4">{module.groupName}</h2>

          <div className="bg-white rounded-lg shadow-lg p-4 mb-6"> {/* Card Container */}
            <div className="module-content">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-transparent text-left">
                    <th className="px-4 py-2 text-xs">Añadir</th>
                    <th className="px-4 py-2 text-xs">Permiso</th>
                    <th className="px-4 py-2 text-xs">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {module.subModules.filter(subModule => isSelected(subModule.key)).map((subModule, index) => (
                    <tr
                      key={subModule.id}
                      className={`${
                        index % 2 === 0 ? 'bg-orange-50' : 'bg-white'
                      } border-t border-gray-200`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected(subModule.key)}
                          readOnly
                          className="form-checkbox h-4 w-4 text-orange-500 accent-orange-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-xs">{subModule.name}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">{subModule.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PermissionsModule;
