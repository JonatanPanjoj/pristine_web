import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FaSave } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiShield, FiCheck } from 'react-icons/fi';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { User } from '../../../models/User';
import useCreateUser from '../hooks/useCreateUser';
import useRolePermissions from '../hooks/useRolePermissions';
import PermissionsForm from '../../../components/Permissions/PermissionsForm';
import useFetchRoles from '../hooks/useFetchRoles';
import { ExitoCard } from '../../../components/ExitoCard';

interface UserFormProps { onSuccess?: () => void; }

// ── CSS estático fuera del componente — no se reinyecta en cada render ────────
const FORM_STYLES = `
  @keyframes uf-formin {
    from { opacity: 0; transform: translateX(-10px) scale(.98); }
    to   { opacity: 1; transform: translateX(0)     scale(1);   }
  }
  /* will-change promueve el panel a capa GPU propia */
  .uf-panel { will-change: transform, opacity; animation: uf-formin .22s cubic-bezier(.34,1.4,.64,1) forwards; }

  /* Dot: transition solo de propiedades baratas */
  .uf-dot { transition: width .25s cubic-bezier(.34,1.4,.64,1), background-color .25s ease; }

  /* Checklist item: solo color, sin transform */
  .uf-check-item { transition: background-color .15s ease; }

  /* Botón: solo color y opacity */
  .uf-btn { transition: background-color .12s, opacity .12s; }
  .uf-btn:active { opacity: .8; }

  /* Scrollbars */
  .uf-scroll-dark::-webkit-scrollbar  { width: 3px; }
  .uf-scroll-dark::-webkit-scrollbar-thumb  { background: rgba(255,255,255,.1); border-radius: 99px; }
  .uf-scroll-light::-webkit-scrollbar { width: 4px; }
  .uf-scroll-light::-webkit-scrollbar-thumb { background: #f0e8e0; border-radius: 99px; }
  .uf-scroll-light::-webkit-scrollbar-thumb:hover { background: #FDBA74; }

  /* ══ Desktop ≥ 640px ══ */
  @media (min-width: 640px) {
    .uf-wrap    { flex-direction: row; }
    .uf-sidebar { display: flex !important; width: 200px; flex-shrink: 0; }
    .uf-topbar  { display: none  !important; }
    .uf-grid    { grid-template-columns: 1fr 1fr; }
    .uf-subheader { display: flex !important; }
  }
  /* ══ Mobile < 640px ══ */
  @media (max-width: 639px) {
    .uf-wrap      { flex-direction: column; }
    .uf-sidebar   { display: none  !important; }
    .uf-topbar    { display: flex  !important; }
    .uf-grid      { grid-template-columns: 1fr; }
    .uf-subheader { display: none  !important; }
  }
`;

// ── StyledInput — lógica original intacta, transition-all → transition-colors ─
const StyledInput: React.FC<{
  name: string; label: string; type?: string;
  required?: boolean; placeholder?: string; disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ name, label, type = 'text', required, placeholder, disabled, icon }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword   = type === 'password';
  const resolvedType = isPassword && showPwd ? 'text' : type;

  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
            {icon}
          </span>
        )}
        <Field
          name={name} type={resolvedType} placeholder={placeholder} disabled={disabled}
          className={`w-full py-2 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800
            placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100
            transition-colors duration-150
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : 'pl-3.5'}`}
        />
        {isPassword && !disabled && (
          <button type="button" onClick={() => setShowPwd(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-orange-500 transition-colors duration-100">
            {showPwd ? <FiEyeOff className="w-3.5 h-3.5"/> : <FiEye className="w-3.5 h-3.5"/>}
          </button>
        )}
      </div>
      <ErrorMessage name={name} render={msg => <p className="mt-1 text-[10px] text-red-400">{msg}</p>}/>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const UserForm: React.FC<UserFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { handleCreateUser, loading, error } = useCreateUser();
  const { roles, loading: rolesLoading, error: rolesError } = useFetchRoles();
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * El rol es una plantilla: al elegirlo se marcan sus permisos, y desde ahí se
   * quitan o se agregan los que haga falta. Lo que se guarda en el usuario es la
   * selección final, no el rol — es lo que decide su acceso.
   */
  const [selectedRole, setSelectedRole] = useState('');
  const { permissionsKeys: rolePermissionKeys } = useRolePermissions(selectedRole);
  const permissionsRef = useRef<{ getSelectedPermissions: () => string[] } | null>(null);

  // Inyectar CSS una sola vez en el head — nunca se re-ejecuta
  useEffect(() => {
    const id = 'uf-styles';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = FORM_STYLES;
      document.head.appendChild(el);
    }
    return () => {};
  }, []);

  return (
    <>

      <Formik
        initialValues={{
          name:'', email:'', phone:'', password:'', user:'',
          is_enabled:true, language:null, notifications_enabled:false,
          personal_answer:'', personal_question:'', rol:'',
          permissions:[] as string[], permissions_source:'usuario' as const,
          url_photo:null, user_id:0, created_at:new Date().toISOString(),
        } as User}
        validationSchema={Yup.object({
          name:     Yup.string().required(t('userForm.validation.required')),
          email:    Yup.string().email(t('userForm.validation.invalidEmail')).required(t('userForm.validation.required')),
          phone:    Yup.string().required(t('userForm.validation.required')),
          password: Yup.string().required(t('userForm.validation.required')),
          user:     Yup.string().required(t('userForm.validation.required')),
          rol:      Yup.string().required(t('userForm.validation.required')),
        })}
        onSubmit={async (values: User, { setSubmitting, resetForm }) => {
          const permissions = permissionsRef.current?.getSelectedPermissions() ?? [];

          // Sin permisos el usuario no podría entrar: el login lo rechaza. Más
          // vale decirlo aquí que dejar creada una cuenta que no sirve.
          if (permissions.length === 0) {
            setSuccess(false);
            setMessage('Selecciona al menos un permiso para el usuario.');
            setShowSuccessCard(true);
            return;
          }

          const userData: User = {
            ...values,
            permissions,
            permissions_source: 'usuario',
            created_at: new Date().toISOString(),
            id: '',
          };
          setSubmitting(true);
          const { success: ok, message: msg } = await handleCreateUser(userData);
          setSubmitting(false);
          setSuccess(ok);
          setMessage(msg || (ok ? 'Usuario creado.' : 'Error al crear el usuario.'));
          setShowSuccessCard(true);
          if (ok) resetForm();
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => {
          const initial  = values.name?.charAt(0)?.toUpperCase() ?? '?';
          const hasName  = values.name.trim().length > 0;
          const hasEmail = /\S+@\S+\.\S+/.test(values.email);

          const checks = [
            { label: 'Nombre',     ok: hasName },
            { label: 'Correo',     ok: hasEmail },
            { label: 'Teléfono',   ok: values.phone.trim().length > 0 },
            { label: 'Usuario',    ok: values.user.trim().length > 0 },
            { label: 'Contraseña', ok: values.password.trim().length > 0 },
            { label: 'Rol',        ok: values.rol.trim().length > 0 },
          ];

          const dots = [
            hasName,
            hasEmail && values.phone.trim().length > 0,
            values.user.trim().length > 0 && values.password.trim().length > 0 && values.rol.trim().length > 0,
          ];

          return (
            <Form>
              <div className="uf-panel uf-wrap flex overflow-hidden" style={{ minHeight: 420 }}>

                {/* ════════════ SIDEBAR oscuro — desktop ════════════ */}
                <div className="uf-sidebar uf-scroll-dark flex-col overflow-y-auto"
                  style={{ display:'none', background:'linear-gradient(160deg,#1c1917,#292524)', padding:'28px 16px' }}>

                  {/* Avatar reactivo — transition solo en background-color (barato) */}
                  <div className="flex flex-col items-center mb-6">
                    {values.url_photo ? (
                      <img src={values.url_photo} alt={values.name}
                        className="w-16 h-16 rounded-2xl object-cover mb-3"
                        style={{ boxShadow:'0 6px 16px rgba(0,0,0,.35)' }}/>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3"
                        style={{
                          background: hasName ? 'linear-gradient(135deg,#f97316,#fbbf24)' : 'rgba(255,255,255,.08)',
                          boxShadow:  hasName ? '0 6px 20px rgba(249,115,22,.3)' : 'none',
                          color:      hasName ? '#fff' : '#57534e',
                          /* transition solo en opacity — evitar animar gradientes */
                          transition: 'opacity .2s ease',
                        }}>
                        {hasName ? initial : '?'}
                      </div>
                    )}
                    <p className="font-semibold text-sm text-center leading-tight px-2"
                      style={{ color: hasName ? '#fff' : '#57534e', transition:'color .15s' }}>
                      {hasName ? values.name : 'Nombre de usuario'}
                    </p>
                    <p className="text-xs text-center mt-1 truncate w-full px-2"
                      style={{ color: hasEmail ? '#a8a29e' : '#44403c' }}>
                      {hasEmail ? values.email : 'correo@ejemplo.com'}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                      style={{ background:'rgba(249,115,22,.2)', color:'#fb923c', border:'1px solid rgba(249,115,22,.3)' }}>
                      Nuevo usuario
                    </span>
                  </div>

                  {/* Checklist — transition solo en background-color */}
                  <div className="flex flex-col gap-1.5">
                    {checks.map((item) => (
                      <div key={item.label}
                        className="uf-check-item flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg"
                        style={{ background: item.ok ? 'rgba(249,115,22,.1)' : 'transparent' }}>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: item.ok ? '#f97316' : 'rgba(255,255,255,.06)',
                            border:     item.ok ? 'none' : '1px solid rgba(255,255,255,.12)',
                            transition: 'background-color .15s',
                          }}>
                          {item.ok && <FiCheck className="w-2.5 h-2.5 text-white"/>}
                        </div>
                        <span className="text-[11px] font-medium"
                          style={{ color: item.ok ? '#fb923c' : '#57534e', transition:'color .15s' }}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ════════════ TOPBAR — mobile ════════════ */}
                <div className="uf-topbar items-center gap-3 shrink-0 px-5 py-4"
                  style={{ display:'none', background:'linear-gradient(160deg,#1c1917,#292524)', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0"
                    style={{ background: hasName ? 'linear-gradient(135deg,#f97316,#fbbf24)' : 'rgba(255,255,255,.1)', transition:'background-color .15s' }}>
                    {hasName ? initial : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: hasName ? '#fff' : '#57534e' }}>
                      {hasName ? values.name : 'Nuevo usuario'}
                    </p>
                    <p className="text-xs truncate" style={{ color:'#78716c' }}>
                      {hasEmail ? values.email : 'correo@ejemplo.com'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ background:'rgba(249,115,22,.2)', color:'#fb923c' }}>Nuevo</span>
                </div>

                {/* ════════════ PANEL DERECHO ════════════ */}
                <div className="flex flex-col flex-1 bg-white overflow-hidden" style={{ minWidth:0 }}>

                  {/* Sub-header desktop */}
                  <div className="uf-subheader items-center justify-between px-7 py-4 border-b border-gray-100 shrink-0"
                    style={{ display:'none' }}>
                    <div>
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">Nuevo usuario</p>
                      <h2 className="text-[15px] font-semibold text-gray-900">Completa los datos del usuario</h2>
                    </div>
                  </div>

                  {/* Campos */}
                  <div className="flex-1 overflow-y-auto uf-scroll-light">
                    <div className="px-5 sm:px-7 py-5 sm:py-6">
                      <div className="grid uf-grid gap-4 mb-5">
                        <StyledInput name="name"     label={t('userForm.form.name')}     required icon={<FiUser  className="w-3.5 h-3.5"/>}/>
                        <StyledInput name="email"    label={t('userForm.form.email')}    required type="email"    icon={<FiMail  className="w-3.5 h-3.5"/>}/>
                        <StyledInput name="phone"    label={t('userForm.form.phone')}    required icon={<FiPhone className="w-3.5 h-3.5"/>}/>
                        <StyledInput name="user"     label={t('userForm.form.user')}     required icon={<FiUser  className="w-3.5 h-3.5"/>}/>
                        <StyledInput name="password" label={t('userForm.form.password')} required type="password" icon={<FiLock  className="w-3.5 h-3.5"/>}/>

                        {/* Rol */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            {t('userForm.form.userRole')}<span className="text-orange-500 ml-0.5">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                              <FiShield className="w-3.5 h-3.5"/>
                            </span>
                            <Field as="select" name="rol" disabled={rolesLoading}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                setFieldValue('rol', e.target.value);
                                setSelectedRole(e.target.value);
                              }}
                              className={`w-full py-2 pl-10 pr-3.5 text-[13px] rounded-lg border bg-gray-50 text-gray-800
                                focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                                transition-colors duration-150 disabled:opacity-50
                                ${values.rol==='' ? 'border-red-300' : 'border-gray-200'}`}>
                              <option value="">{rolesLoading ? t('userForm.form.loading') : t('userForm.form.selectRole')}</option>
                              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </Field>
                          </div>
                          {values.rol==='' && <p className="mt-1 text-[10px] text-red-400">{t('userForm.validation.required')}</p>}
                          {rolesError && <p className="mt-1 text-[10px] text-red-400">{rolesError}</p>}
                        </div>
                      </div>

                      {/* Permisos del usuario */}
                      <div className="mb-5">
                        <div className="flex items-baseline justify-between mb-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Permisos del usuario<span className="text-orange-500 ml-0.5">*</span>
                          </label>
                          <span className="text-[10px] text-gray-400">
                            {values.rol === ''
                              ? 'Elige un rol para partir de su plantilla'
                              : 'Marcados los del rol; puedes quitar o agregar'}
                          </span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 max-h-72 overflow-y-auto uf-scroll-light">
                          <PermissionsForm ref={permissionsRef} preSelectedKeys={rolePermissionKeys} />
                        </div>
                      </div>

                      {/* Toggle is_enabled — lógica original intacta */}
                      <label className="flex items-center gap-3 mb-2 cursor-pointer group select-none">
                        <Field type="checkbox" name="is_enabled" className="sr-only peer"/>
                        <div className="relative w-9 h-5 shrink-0">
                          <div className="w-full h-full rounded-full bg-gray-200 peer-checked:bg-orange-500 transition-colors duration-150"/>
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-150 peer-checked:translate-x-4"/>
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-100">
                          {t('userForm.form.changePasswordOnLogin')}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Footer sticky */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 sm:px-7 py-3 sm:py-4 flex items-center justify-between shrink-0">
                    {/* Dots de progreso */}
                    <div className="flex items-center gap-1.5">
                      {dots.map((done, i) => (
                        <div key={i} className="uf-dot h-1.5 rounded-full"
                          style={{ width: done ? 24 : 7, background: done ? '#f97316' : '#e5e7eb' }}/>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      {error && <p className="text-[11px] text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>}
                      <button type="submit" disabled={isSubmitting||loading||rolesLoading}
                        className="uf-btn inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading
                          ? <><MdRefresh className="animate-spin w-4 h-4"/>{t('userForm.button.loading')}</>
                          : <><FaSave className="w-3.5 h-3.5"/>{t('userForm.button.save')}</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>

      {showSuccessCard && (
        <ExitoCard
          onClose={() => { setShowSuccessCard(false); if (success && onSuccess) onSuccess(); }}
          loading={loading} success={success} message={message}
        />
      )}
    </>
  );
};

export default UserForm;