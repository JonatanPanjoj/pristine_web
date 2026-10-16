import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { HiOutlineIdentification, HiOutlineKey } from 'react-icons/hi';
import FormInput from '../../../components/FormInput';
import PermissionsForm from '../../../components/Permissions/PermissionsForm';
import { useAddRoleToDatabase } from '../hooks/useAddRoleToDatabase'; // Hook para añadir roles
import { useFetchPermissionsByKeys } from '../hooks/useFetchPermissionsByKeys';
import { ExitoCard } from '../../../components/ExitoCard';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { Role } from '../../../models/Role';
import { useNavigate } from 'react-router-dom';
import useMenuLinks from '../../../route/routerLink/useMenuLinks';
import { useFetchPermissionKeys } from '../hooks/useFetchPermissionKeys';
import { useEditRole } from '../hooks/useEditRole'; // Hook para editar roles

interface RoleFormProps {
  role?: Role;
  disabled?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, disabled = false }) => {
  const { t } = useTranslation();
  const { addNewRole, loading: addLoading, error: addError, success: addSuccess } = useAddRoleToDatabase();
  const { editRole, loading: editLoading, error: editError, success: editSuccess } = useEditRole(); // Hook para editar roles
  const permissionsFormRef = useRef<any>(null);
  const { fetchPermissions, permissionIds, loading: permissionsLoading, error: permissionsError } = useFetchPermissionsByKeys();
  const { fetchPermissionKeys, permissionKeys, loading: keysLoading, error: keysError } = useFetchPermissionKeys();

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formValues, setFormValues] = useState<Role | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const { getLinkByName } = useMenuLinks();
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(getLinkByName('permissionManager'));
  };

  // Validación del formulario con Yup
  const validationSchema = Yup.object({
    name: Yup.string().required(t('roleForm.validation.required')),
    description: Yup.string().required(t('roleForm.validation.required')),
  });

  const handleNotificationClose = () => {
    setShowNotification(false);
    if (notificationSuccess) {
      const currentPath = window.location.pathname; // Obtén el path actual
      const targetPath = getLinkByName('permissionManager'); // Obtén el path de permissionManager
      
      if (currentPath === targetPath) {
        window.location.reload(); // Recarga la página si ya está en la misma
      } else {
        handleNavigate(); // Navega a permissionManager si no está en esa página
      }
    }
  };
  
  const permissionsTranslatedRef = useRef(false);

  useEffect(() => {
    const translatePermissions = async () => {
      if (role && role.permissions.length > 0 && !permissionsTranslatedRef.current) {
        await fetchPermissionKeys(role.permissions);
        permissionsTranslatedRef.current = true;
      }
    };

    if (role && !permissionsTranslatedRef.current) {
      translatePermissions();
    }
  }, [role, fetchPermissionKeys]);

  // Este hook actualiza los valores del formulario si la prop role cambia
  useEffect(() => {
    if (role) {
      setFormValues({
        name: role.name,
        description: role.description,
        category: role.category,
        id: role.id,
        is_enabled: role.is_enabled,
        permissions: role.permissions,
        rol_id: role.rol_id,
      });
    }
  }, [role]);

  // Sincronización de éxito/error en la creación y edición de roles
  useEffect(() => {
    if (addSuccess || editSuccess) {
      setNotificationSuccess(true);
      setNotificationMessage(addSuccess ? 'Rol creado con éxito.' : 'Rol actualizado con éxito.');
      setShowNotification(true);
    } else if (addError || editError) {
      setNotificationSuccess(false);
      setNotificationMessage(addError || editError || 'Error al procesar el rol.');
      setShowNotification(true);
    }
  }, [addSuccess, addError, editSuccess, editError]);

  useEffect(() => {
    if (permissionsError) {
      setNotificationSuccess(false);
      setNotificationMessage('Error al traducir los permisos.');
      setShowNotification(true);
    }
  }, [permissionsError]);

  const handleConfirmSave = async (values: Role) => {
    if (!permissionsFormRef.current) {
      setNotificationMessage('Formulario de permisos no está listo.');
      setNotificationSuccess(false);
      setShowNotification(true);
      return;
    }

    const selectedPermissions = permissionsFormRef.current.getSelectedPermissions();
    if (!selectedPermissions.length) {
      setNotificationMessage('Selecciona al menos un permiso.');
      setNotificationSuccess(false);
      setShowNotification(true);
      return;
    }

    try {
      await fetchPermissions(selectedPermissions);
      setFormValues(values);
      setIsConfirmationOpen(true);
    } catch (error) {
      setNotificationMessage('Error al traducir los permisos.');
      setNotificationSuccess(false);
      setShowNotification(true);
    }
  };

  const handleSaveRole = async () => {
    if (formValues && permissionIds.length > 0) {
      const roleToAdd: Role = {
        ...formValues,
        permissions: permissionIds,
      };
      try {
        await addNewRole(roleToAdd);
        setIsConfirmationOpen(false);
      } catch (err) {
        setNotificationMessage(addError || 'Error al crear el rol.');
        setNotificationSuccess(false);
        setShowNotification(true);
      }
    }
  };

  const handleUpdateRole = async () => {
    if (formValues && permissionIds.length > 0) {
      const updatedRole: Role = {
        ...formValues,
        permissions: permissionIds,
      };
      try {
        await editRole(updatedRole); // Usamos el hook useEditRole para actualizar
        setIsConfirmationOpen(false);

      } catch (err) {
        setNotificationMessage(err instanceof Error ? err.message : 'Error al actualizar el rol.');
        setNotificationSuccess(false);
        setShowNotification(true);
      }
    }
    console.log(permissionIds)
  };

  const busy = addLoading || editLoading || permissionsLoading || keysLoading;

  return (
    <>
      <Formik
        initialValues={formValues || {
          name: '',
          description: '',
          category: '',
          id: '',
          is_enabled: true,
          permissions: [],
          rol_id: 0,
        }}
        validationSchema={validationSchema}
        onSubmit={handleConfirmSave}
        enableReinitialize={true}
      >
        {({ resetForm }) => (
          <Form>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {/* Datos del rol */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-9 h-9 rounded-xl bg-primary-gold/10 text-primary-gold flex items-center justify-center shrink-0"><HiOutlineIdentification className="w-5 h-5" /></span>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">{role ? 'Datos del rol' : 'Nuevo rol de permisos'}</h2>
                    <p className="text-xs text-slate-400">{role ? 'Edita la información del rol.' : 'Define el nuevo rol.'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <FormInput label={t('roleForm.form.name')} name="name" disabled={busy || disabled} />
                  <FormInput label={t('roleForm.form.description')} name="description" isTextarea rows={4} disabled={busy || disabled} />
                </div>
              </div>

              {/* Permisos */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-9 h-9 rounded-xl bg-primary-gold/10 text-primary-gold flex items-center justify-center shrink-0"><HiOutlineKey className="w-5 h-5" /></span>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Permisos</h2>
                    <p className="text-xs text-slate-400">Selecciona los permisos para este rol.</p>
                  </div>
                </div>
                <PermissionsForm ref={permissionsFormRef} disable={disabled} preSelectedKeys={permissionKeys || []} />
              </div>
            </div>

            {!disabled && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { resetForm(); permissionsFormRef.current?.clear?.(); }}
                  className="px-8 py-3 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold text-white bg-primary-gold shadow-[0_4px_12px_rgba(221,152,3,0.25)] hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy ? t('roleForm.button.loading') : role ? t('roleForm.button.update') : t('roleForm.button.save')}
                </button>
              </div>
            )}
          </Form>
        )}
      </Formik>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        message={t('roleForm.confirmation.message')}
        onConfirm={role ? handleUpdateRole : handleSaveRole}
        onCancel={() => setIsConfirmationOpen(false)}
      />

      {showNotification && (
        <ExitoCard
          onClose={handleNotificationClose}
          loading={busy}
          success={notificationSuccess}
          message={notificationMessage}
        />
      )}
    </>
  );
};

export default RoleForm;
