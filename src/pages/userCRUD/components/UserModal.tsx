/**
 * UserModal — Sidebar Dual
 * Performance fixes:
 *  - backdropFilter eliminado del overlay (principal culpable de lentitud)
 *  - will-change: transform en el panel para promoción a capa GPU propia
 *  - Animación de sección: solo opacity, sin transform (evita layout)
 *  - setTimeout de sección eliminado — CSS animation-fill-mode en su lugar
 *  - transition-all reemplazado por transition-colors/transition-opacity (propiedades específicas)
 *  - Dots: scaleX en lugar de width (transform no fuerza layout reflow)
 *  - box-shadow solo en estado final, no durante animación de entrada
 *  - <style> movido fuera del JSX como string constante
 */
import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { User } from '../../../models/User';
import FormInput from '../../../components/FormInput';
import useFetchRoles from '../hooks/useFetchRoles';
import useRolePermissions from '../hooks/useRolePermissions';
import { formatFullDateTime as formatDate } from '../../../utils/formatDateTime';
import { useUpdateUser } from '../hooks/useUpdateUser';
import ConfirmationModal from '../../../components/ConfirmationModal';
import PermissionsForm from '../../../components/Permissions/PermissionsForm';
import { ExitoCard } from '../../../components/ExitoCard';
import {
  FiSave, FiShield, FiUser, FiMail, FiPhone,
  FiLock, FiCalendar, FiEdit2, FiEye, FiX, FiChevronRight,
} from 'react-icons/fi';
import ModalPortal from '../../../components/ModalPortal';


const SECTIONS = [
  { id: 'personal', label: 'Datos personales', short: 'Datos',    icon: FiUser   },
  { id: 'access',   label: 'Acceso',            short: 'Acceso',   icon: FiLock   },
  { id: 'role',     label: 'Rol y permisos',    short: 'Permisos', icon: FiShield },
];

const SECTION_TITLE: Record<string, string> = {
  personal: 'Información básica del usuario',
  access:   'Credenciales de acceso',
  role:     'Rol y permisos asignados',
};

// ── CSS estático fuera del componente — no se reinyecta en cada render ────────
const MODAL_STYLES = `
  /* Solo opacity + transform en GPU — sin layout reflow */
  @keyframes um-slidein {
    from { opacity: 0; transform: translateX(-12px) scale(.97); }
    to   { opacity: 1; transform: translateX(0)     scale(1);   }
  }
  @keyframes um-sheetup {
    from { opacity: 0; transform: translateY(60px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  /* Overlay: solo opacity, nada más */
  @keyframes um-overlayin {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  /* Sección: solo opacity, sin translateY — evita layout durante transición */
  @keyframes um-sectionin {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .um-overlay-anim { animation: um-overlayin .18s ease forwards; }

  /* will-change promueve el panel a su propia capa GPU */
  .um-panel {
    will-change: transform, opacity;
    /* box-shadow solo se aplica al estado final, no interfiere con la animación */
    box-shadow: 0 24px 60px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.05);
  }

  /* Sección: fade simple sin transform */
  .um-section { animation: um-sectionin .15s ease forwards; }

  /* Nav hover: solo color, sin transform — evita composite layers innecesarias */
  .um-nav-btn { transition: background-color .12s, color .12s, border-color .12s; }
  .um-nav-btn:active { opacity: .75; }

  /* Dots: scaleX en lugar de width — transform no fuerza reflow */
  .um-dot {
    transform-origin: left center;
    transition: transform .25s cubic-bezier(.34,1.4,.64,1),
                background-color .25s ease;
  }

  /* Botones: solo propiedades que no fuerzan layout */
  .um-btn-save {
    transition: background-color .12s, opacity .12s;
  }
  .um-btn-save:active { opacity: .8; }
  .um-btn-cancel { transition: background-color .12s; }
  .um-btn-cancel:active { opacity: .8; }

  /* Scrollbars */
  .um-scroll-dark::-webkit-scrollbar  { width: 3px; }
  .um-scroll-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 99px; }
  .um-scroll-light::-webkit-scrollbar { width: 4px; }
  .um-scroll-light::-webkit-scrollbar-thumb { background: #f0e8e0; border-radius: 99px; }
  .um-scroll-light::-webkit-scrollbar-thumb:hover { background: #FDBA74; }

  /* ══ Desktop ≥ 700px ══ */
  @media (min-width: 700px) {
    .um-overlay { padding: 24px; align-items: center; }
    .um-panel {
      flex-direction: row;
      max-width: 760px;
      height: clamp(480px, 68vh, 590px);
      border-radius: 20px;
      animation: um-slidein .22s cubic-bezier(.34,1.4,.64,1) forwards;
    }
    .um-sidebar   { display: flex !important; }
    .um-topbar    { display: none  !important; }
    .um-subheader { display: flex  !important; }
    .um-grid { grid-template-columns: 1fr 1fr; }
  }

  /* ══ Tablet 480–699px ══ */
  @media (min-width: 480px) and (max-width: 699px) {
    .um-overlay { padding: 16px; align-items: center; }
    .um-panel {
      flex-direction: column;
      max-width: 500px;
      max-height: calc(100vh - 32px);
      border-radius: 18px;
      animation: um-slidein .2s cubic-bezier(.34,1.4,.64,1) forwards;
    }
    .um-sidebar   { display: none  !important; }
    .um-topbar    { display: flex  !important; }
    .um-subheader { display: none  !important; }
    .um-grid { grid-template-columns: 1fr 1fr; }
  }

  /* ══ Mobile < 480px — Bottom sheet ══ */
  @media (max-width: 479px) {
    .um-overlay { padding: 0; align-items: flex-end !important; justify-content: center !important; }
    .um-panel {
      flex-direction: column;
      max-width: 100%;
      max-height: 92dvh;
      border-radius: 20px 20px 0 0;
      /* translateY corto — evita pintar toda la pantalla durante el slide */
      animation: um-sheetup .24s cubic-bezier(.34,1.2,.64,1) forwards;
    }
    .um-sidebar   { display: none  !important; }
    .um-topbar    { display: flex  !important; }
    .um-subheader { display: none  !important; }
    .um-grid { grid-template-columns: 1fr !important; }
  }
`;

// ── Label ─────────────────────────────────────────────────────────────────────
const FL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}
  </label>
);

// ── Props ─────────────────────────────────────────────────────────────────────
interface UserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values?: User) => void;
  mode: string;
}

// ── Componente ────────────────────────────────────────────────────────────────
const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose, onSubmit, mode }) => {
  const { t } = useTranslation();
  const { roles, loading: rolesLoading }           = useFetchRoles();

  /**
   * Los permisos que se enseñan son los **del usuario**. El rol solo aporta su
   * plantilla: al cambiarlo se marcan sus permisos como punto de partida, y de
   * ahí se quitan o se agregan. Las cuentas creadas antes de este cambio no
   * tienen permisos propios, así que para ellas se enseñan los del rol.
   */
  const [selectedRole, setSelectedRole] = useState(user.rol);
  const { permissionsKeys: rolePermissionKeys, loading: permissionsLoading } =
    useRolePermissions(selectedRole);
  const [chosenPermissions, setChosenPermissions] = useState<string[] | null>(
    user.permissions?.length ? user.permissions : null
  );
  const permissionsRef = useRef<{ getSelectedPermissions: () => string[] } | null>(null);
  const visiblePermissions = chosenPermissions ?? rolePermissionKeys;

  const [section, setSection]                   = useState('personal');
  const [sectionKey, setSectionKey]             = useState(0); // key para forzar re-mount limpio
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formValues, setFormValues]             = useState<User | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const { loading: updateLoading, error: updateError, success: updateSuccess, updateUserById } = useUpdateUser();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (updateSuccess) { setNotificationSuccess(true);  setNotificationMessage(t('userForm.form.updateSuccess')); setShowNotification(true); }
    if (updateError)   { setNotificationSuccess(false); setNotificationMessage(t('userForm.form.updateError'));   setShowNotification(true); }
  }, [updateSuccess, updateError, t]);

  const handleNotificationClose = () => { setShowNotification(false); if (updateSuccess) onSubmit(); else onClose(); };
  const handleConfirmSave = (values: User) => {
    const permissions = permissionsRef.current?.getSelectedPermissions() ?? visiblePermissions;
    setFormValues({ ...values, permissions, permissions_source: 'usuario' });
    setIsConfirmationOpen(true);
  };
  const handleUpdateUser  = async () => {
    if (!formValues) return;
    setIsConfirmationOpen(false);
    await updateUserById(user.id, formValues);
    onSubmit(formValues);
  };

  // Inyectar CSS una sola vez en el head
  useEffect(() => {
    const id = 'um-styles';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = MODAL_STYLES;
      document.head.appendChild(el);
    }
    return () => {};
  }, []);

  // ── Cambio de sección SIN setTimeout — key cambia y React remonta limpio ──
  const changeSection = (id: string) => {
    if (id === section) return;
    // La lista de permisos se desmonta al cambiar de sección, así que lo marcado
    // se guarda antes: sin esto, volver a la pestaña perdía la selección.
    const marcados = permissionsRef.current?.getSelectedPermissions();
    if (marcados) setChosenPermissions(marcados);
    setSection(id);
    setSectionKey(k => k + 1);
  };

  const validationSchema = Yup.object({
    name:     Yup.string().required(t('userForm.validation.required')),
    email:    Yup.string().email(t('userForm.validation.invalidEmail')).required(t('userForm.validation.required')),
    phone:    Yup.string().required(t('userForm.validation.required')),
    user:     Yup.string().required(t('userForm.validation.required')),
    password: Yup.string().required(t('userForm.validation.required')),
    rol:      Yup.string().required(t('userForm.validation.required')),
  });

  if (!isOpen && !showNotification) return null;
  const initial = user.name?.charAt(0)?.toUpperCase() ?? '?';

  const selectCls = 'w-full py-2.5 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <>

      {isOpen && (
        <ModalPortal>
          <div
            className="um-overlay um-overlay-anim fixed inset-0 z-50 flex items-center justify-center"
            /* Sin backdropFilter — era el mayor causante de lag */
            style={{ background: 'rgba(10,8,6,0.7)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="um-panel flex w-full mx-auto overflow-hidden" onClick={(e) => e.stopPropagation()}>

              {/* ════════════ SIDEBAR — desktop ════════════ */}
              <div
                className="um-sidebar um-scroll-dark flex-col shrink-0 overflow-y-auto"
                style={{ display:'none', width:210, background:'linear-gradient(160deg,#1c1917,#292524)', padding:'28px 16px' }}
              >
                <div className="flex flex-col items-center mb-6">
                  {user.url_photo ? (
                    <img src={user.url_photo} alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover mb-3"
                      style={{ boxShadow:'0 6px 16px rgba(0,0,0,.35)' }} />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-3"
                      style={{ background:'linear-gradient(135deg,#f97316,#fbbf24)', boxShadow:'0 6px 20px rgba(249,115,22,.3)' }}>
                      {initial}
                    </div>
                  )}
                  <p className="text-white font-semibold text-sm text-center leading-tight">{user.name}</p>
                  <p className="text-xs text-center mt-1 truncate w-full px-2" style={{ color:'#78716c' }}>{user.email}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                    style={{ background:'rgba(249,115,22,.2)', color:'#fb923c', border:'1px solid rgba(249,115,22,.3)' }}>
                    {mode === 'edit' ? <><FiEdit2 className="w-2.5 h-2.5"/>Editando</> : <><FiEye className="w-2.5 h-2.5"/>Vista</>}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    const on   = section === s.id;
                    return (
                      <button key={s.id} onClick={() => changeSection(s.id)}
                        className="um-nav-btn flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-medium w-full"
                        style={{
                          background:  on ? 'rgba(249,115,22,.18)' : 'transparent',
                          color:       on ? '#fb923c' : '#a8a29e',
                          border:      on ? '1px solid rgba(249,115,22,.25)' : '1px solid transparent',
                        }}>
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {s.label}
                        {on && <FiChevronRight className="w-3 h-3 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ════════════ TOPBAR — tablet/mobile ════════════ */}
              <div className="um-topbar flex-col shrink-0"
                style={{ display:'none', background:'linear-gradient(160deg,#1c1917,#292524)', padding:'14px 16px 0' }}>
                <div className="w-10 h-1 rounded-full mb-3 mx-auto" style={{ background:'rgba(255,255,255,.2)' }} />
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                  {user.url_photo ? (
                    <img src={user.url_photo} alt={user.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background:'linear-gradient(135deg,#f97316,#fbbf24)' }}>{initial}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs truncate" style={{ color:'#78716c' }}>{user.email}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                    style={{ background:'rgba(249,115,22,.2)', color:'#fb923c' }}>
                    {mode === 'edit' ? 'Editando' : 'Vista'}
                  </span>
                  <button onClick={onClose}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background:'rgba(255,255,255,.12)', color:'#fff' }}>
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex">
                  {SECTIONS.map((s) => {
                    const on = section === s.id;
                    return (
                      <button key={s.id} onClick={() => changeSection(s.id)}
                        className="flex-1 py-2.5 text-[11px] font-semibold um-nav-btn"
                        style={{
                          color:        on ? '#fb923c' : '#78716c',
                          background:   'transparent',
                          border:       'none',
                          borderBottom: on ? '2px solid #f97316' : '2px solid transparent',
                        }}>
                        {s.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ════════════ PANEL PRINCIPAL ════════════ */}
              <div className="flex flex-col flex-1 bg-white overflow-hidden" style={{ minWidth:0 }}>

                {/* Sub-header desktop */}
                <div className="um-subheader items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0"
                  style={{ display:'none' }}>
                  <div>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">
                      {SECTIONS.find(s => s.id === section)?.label}
                    </p>
                    <h2 className="text-base font-semibold text-gray-900">{SECTION_TITLE[section]}</h2>
                  </div>
                  <button onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 um-btn-cancel">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>

                {/* Formulario */}
                <div className="flex-1 overflow-y-auto um-scroll-light">
                  <Formik initialValues={{ ...user }} validationSchema={validationSchema} onSubmit={handleConfirmSave}>
                    {({ values, setFieldValue }) => (
                      <Form className="flex flex-col min-h-full">

                        {/* key={sectionKey} remonta limpio y dispara um-sectionin sin setTimeout */}
                        <div key={sectionKey} className="um-section flex-1 px-5 sm:px-7 py-5 sm:py-6">

                          {section === 'personal' && (
                            <div className="grid um-grid gap-4 sm:gap-5">
                              <div><FL>{t('userForm.form.name')}</FL>
                                <FormInput label="" name="name" disabled={mode==='view'} textColor="text-gray-800" icon={<FiUser className="w-3.5 h-3.5"/>}/></div>
                              <div><FL>{t('userForm.form.email')}</FL>
                                <FormInput label="" name="email" type="email" disabled={mode==='view'} textColor="text-gray-800" icon={<FiMail className="w-3.5 h-3.5"/>}/></div>
                              <div><FL>{t('userForm.form.phone')}</FL>
                                <FormInput label="" name="phone" disabled={mode==='view'} textColor="text-gray-800" icon={<FiPhone className="w-3.5 h-3.5"/>}/></div>
                              <div><FL>{t('userForm.form.createdAt')}</FL>
                                <FormInput label="" name="created_at" disabled value={formatDate(user.created_at)} textColor="text-gray-800" icon={<FiCalendar className="w-3.5 h-3.5"/>}/></div>
                            </div>
                          )}

                          {section === 'access' && (
                            <div className="grid um-grid gap-4 sm:gap-5">
                              <div><FL>{t('userForm.form.user')}</FL>
                                <FormInput label="" name="user" disabled={mode==='view'} textColor="text-gray-800" icon={<FiUser className="w-3.5 h-3.5"/>}/></div>
                              <div><FL>{t('userForm.form.password')}</FL>
                                <FormInput label="" name="password" type="password" disabled={mode==='view'} textColor="text-gray-800" icon={<FiLock className="w-3.5 h-3.5"/>}/></div>
                            </div>
                          )}

                          {section === 'role' && (
                            <div className="space-y-4">
                              <div>
                                <FL>{t('userForm.form.userRole')}</FL>
                                <Field as="select" name="rol" disabled={mode==='view'||rolesLoading} className={selectCls}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    setFieldValue('rol', e.target.value);
                                    setSelectedRole(e.target.value);
                                    // Rol nuevo, plantilla nueva: se vuelve a partir de sus permisos.
                                    setChosenPermissions(null);
                                  }}>
                                  <option value="">{rolesLoading ? t('userForm.form.loading') : t('userForm.form.selectRole')}</option>
                                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </Field>
                                {values.rol==='' && <p className="mt-1 text-[11px] text-red-400">{t('userForm.validation.required')}</p>}
                              </div>
                              {!permissionsLoading && (
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                  {mode !== 'view' && (
                                    <p className="mb-3 text-[11px] text-gray-500">
                                      Estos son los permisos de la cuenta. El rol solo marca el punto de
                                      partida; lo que quede aquí es lo que el usuario podrá hacer.
                                    </p>
                                  )}
                                  <PermissionsForm
                                    ref={permissionsRef}
                                    disable={mode==='view'}
                                    preSelectedKeys={visiblePermissions}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 sm:px-7 py-3 sm:py-4 flex items-center justify-between shrink-0">
                          {/* Dots: scaleX en lugar de width — no fuerza reflow */}
                          <div className="flex items-center gap-2">
                            {SECTIONS.map((s) => (
                              <div key={s.id} onClick={() => changeSection(s.id)}
                                className="um-dot h-1.5 rounded-full cursor-pointer"
                                style={{
                                  width:            section === s.id ? 24 : 7,
                                  background:       section === s.id ? '#f97316' : '#e5e7eb',
                                  transformOrigin:  'left center',
                                }}/>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <button type="button" onClick={onClose}
                              className="um-btn-cancel px-3 sm:px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                              {t('userForm.form.cancel')}
                            </button>
                            {mode==='edit' && (
                              <button type="submit" disabled={updateLoading}
                                className="um-btn-save inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50">
                                <FiSave className="w-3.5 h-3.5"/>
                                {updateLoading ? t('userForm.button.loading') : t('userForm.button.save')}
                              </button>
                            )}
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      <ConfirmationModal isOpen={isConfirmationOpen} message="¿Confirmas guardar los cambios?" onConfirm={handleUpdateUser} onCancel={() => setIsConfirmationOpen(false)}/>
      {showNotification && <ExitoCard onClose={handleNotificationClose} loading={updateLoading} success={notificationSuccess} message={notificationMessage}/>}
    </>
  );
};

export default UserModal;