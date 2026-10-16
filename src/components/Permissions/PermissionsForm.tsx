import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface PermissionsFormProps {
  disable?: boolean; // Prop para habilitar o deshabilitar los checkboxes
  preSelectedKeys?: string[]; // Permisos que deberían estar preseleccionados
}

const PermissionsForm = forwardRef((props: PermissionsFormProps, ref) => {
  const { disable = false, preSelectedKeys = [] } = props; // Valores por defecto de las props
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<number[]>([1]); // El primer módulo estará abierto inicialmente

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


  // Efecto para cargar los permisos preseleccionados cuando el componente se monta
  useEffect(() => {
    if (preSelectedKeys && preSelectedKeys.length > 0) {
      setSelectedKeys(preSelectedKeys);
    }

    // Si la prop disable es true, expandimos todos los módulos
    if (disable) {
      setExpandedModules(modules.map(module => module.groupId)); // Expandir todos los módulos si disable es true
    }
  }, [preSelectedKeys, disable]);

  // Exponer la función getSelectedPermissions para que sea accesible desde el ref
  useImperativeHandle(ref, () => ({
    getSelectedPermissions: () => selectedKeys,
    clear: () => setSelectedKeys([]),
  }));

  const handleCheckboxChange = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter((selectedKey) => selectedKey !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  // Función para manejar "Seleccionar todo"
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      // Seleccionar todas las claves
      const allKeys = modules.flatMap((module) => module.subModules.map((subModule) => subModule.key));
      setSelectedKeys(allKeys);
    } else {
      // Deseleccionar todas las claves
      setSelectedKeys([]);
    }
  };

  // Función para manejar "Seleccionar todo por módulo"
  const handleSelectAllModule = (moduleId: number, isChecked: boolean) => {
    const moduleKeys = modules.find(module => module.groupId === moduleId)?.subModules.map(subModule => subModule.key) || [];

    if (isChecked) {
      // Añadir los permisos del módulo si no están ya seleccionados
      setSelectedKeys([...selectedKeys, ...moduleKeys.filter((key) => !selectedKeys.includes(key))]);
    } else {
      // Eliminar los permisos del módulo
      setSelectedKeys(selectedKeys.filter(key => !moduleKeys.includes(key)));
    }
  };

  // Función para expandir/contraer los módulos
  const toggleModule = (moduleId: number) => {
    if (expandedModules.includes(moduleId)) {
      setExpandedModules(expandedModules.filter(id => id !== moduleId));
    } else {
      setExpandedModules([...expandedModules, moduleId]);
    }
  };

  const distinctKeys = Array.from(new Set(modules.flatMap((m) => m.subModules.map((s) => s.key))));
  const allSelected = distinctKeys.length > 0 && distinctKeys.every((k) => selectedKeys.includes(k));

  return (
    <div id="permissions-form" className="space-y-3">
      {/* Seleccionar todas */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Permisos asignados</span>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            onChange={(e) => handleSelectAll(e.target.checked)}
            checked={allSelected}
            disabled={disable}
            className="w-4 h-4 accent-primary-gold"
          />
          <span className="text-xs font-semibold text-slate-600">Seleccionar todas ({distinctKeys.length})</span>
        </label>
      </div>

      {modules.map((module) => {
        const total = module.subModules.length;
        const count = module.subModules.filter((s) => selectedKeys.includes(s.key)).length;
        const allInModule = module.subModules.every((s) => selectedKeys.includes(s.key));
        const expanded = expandedModules.includes(module.groupId);
        return (
          <div key={module.groupId} className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-white">
              <input
                type="checkbox"
                onChange={(e) => handleSelectAllModule(module.groupId, e.target.checked)}
                checked={allInModule}
                disabled={disable}
                className="w-4 h-4 accent-primary-gold shrink-0"
              />
              <button type="button" onClick={() => toggleModule(module.groupId)} className="flex-1 flex items-center justify-between gap-2 text-left">
                <span className="text-sm font-semibold text-slate-700">
                  {module.groupName} <span className="text-xs font-medium text-slate-400">({count}/{total})</span>
                </span>
                <FiChevronDown className={`w-5 h-5 text-primary-gold transition-transform duration-300 shrink-0 ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {expanded && (
              <div className="px-4 pb-3 pt-1 bg-slate-50/40 border-t border-slate-100">
                {module.subModules.map((subModule) => (
                  <label
                    key={subModule.id}
                    className={`flex items-center gap-2.5 py-1.5 px-1 rounded-lg ${disable ? '' : 'cursor-pointer hover:bg-white'}`}
                  >
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(subModule.key)}
                      checked={selectedKeys.includes(subModule.key)}
                      disabled={disable}
                      className="w-4 h-4 accent-primary-gold shrink-0"
                    />
                    <span className="text-[13px] text-slate-600">{subModule.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default PermissionsForm;
