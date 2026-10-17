import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BrandLogo, LoginField, PrimaryButton } from '../components/LoginPrimitives';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const resetSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, t('login.password_too_short', 'La contraseña debe tener al menos 6 caracteres'))
      .required(t('login.password_required', 'La contraseña es requerida')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('login.passwords_must_match', 'Las contraseñas deben coincidir'))
      .required(t('login.confirm_password_required', 'Por favor confirma tu contraseña')),
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setErrorMsg(null);
    if (!token) {
      setErrorMsg(t('login.missing_token', 'El token de restablecimiento no está presente.'));
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('https://us-central1-leaguer-2ed58.cloudfunctions.net/resetPasswordWithToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('login.reset_error', 'Ocurrió un error al restablecer la contraseña.'));
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || t('login.reset_error', 'Error de conexión con el servidor.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F6F7FD] flex items-center justify-center px-4 py-8 sm:px-6 overflow-hidden">
      {/* Círculos decorativos animados (Consistencia estética con el Login) */}
      <motion.div
        className="pointer-events-none absolute -left-36 top-1/2 hidden h-96 w-96 rounded-full bg-[#389CD6]/15 lg:block"
        aria-hidden="true"
        animate={{ scale: [1, 1.06, 1], y: ["-50%", "-48%", "-50%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: "-50%" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#389CD6]/20 sm:h-64 sm:w-64"
        aria-hidden="true"
        animate={{ scale: [1, 1.10, 1] }}
        transition={{ duration: 9, delay: 1, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-10 right-[42%] h-16 w-16 rounded-full bg-[#389CD6]/25 sm:h-24 sm:w-24"
        aria-hidden="true"
        animate={{ scale: [1, 1.14, 1] }}
        transition={{ duration: 7, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative w-full max-w-md bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-[32px] border border-slate-100 z-10">
        <div className="flex justify-center mb-6">
          <BrandLogo />
        </div>

        {/* SI SE RESTABLECIÓ CON ÉXITO */}
        {success ? (
          <div className="text-center py-4 space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#1E293B]">
                {t('login.reset_success_title', 'Contraseña restablecida')}
              </h3>
              <p className="text-[13px] text-[#64758B] leading-relaxed px-2">
                {t('login.reset_success_desc', 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión con tus nuevas credenciales.')}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FCB521] px-8 py-3 font-bold text-sm text-white shadow-[0_4px_12px_rgba(221,152,3,0.25)] transition-all hover:bg-[#FFA700] hover:shadow-[0_6px_18px_rgba(221,152,3,0.35)] active:scale-[0.99]"
              >
                {t('login.go_to_login', 'Ir al inicio de sesión')}
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE RESTABLECIMIENTO */
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-[#1E293B]">
                {t('login.new_password_title', 'Establecer nueva contraseña')}
              </h2>
              <p className="mt-1 text-[13px] text-[#94A4B8]">
                {t('login.new_password_subtitle', 'Elige una contraseña segura para tu cuenta')}
              </p>
            </div>

            {!token ? (
              <div className="text-center py-4">
                <p className="text-red-600 text-sm font-medium">
                  {t('login.invalid_reset_token', 'Enlace de restablecimiento inválido. Por favor, solicita uno nuevo.')}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm font-semibold text-[#64758B] hover:text-[#1E293B] transition-colors"
                  >
                    {t('login.back_to_login', 'Volver al inicio de sesión')}
                  </button>
                </div>
              </div>
            ) : (
              <Formik
                initialValues={{ password: '', confirmPassword: '' }}
                validationSchema={resetSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <LoginField
                      name="password"
                      label={t('login.new_password_label', 'Nueva contraseña')}
                      type="password"
                      icon="lock"
                      placeholder={t('login.new_password_placeholder', 'Ingresa la nueva contraseña')}
                    />

                    <LoginField
                      name="confirmPassword"
                      label={t('login.confirm_password_label', 'Confirmar nueva contraseña')}
                      type="password"
                      icon="lock"
                      placeholder={t('login.confirm_password_placeholder', 'Repite la nueva contraseña')}
                    />

                    <div className="pt-4 flex flex-col gap-3">
                      <PrimaryButton withArrow disabled={isSubmitting}>
                        {isSubmitting ? t('login.sending') : t('login.reset_submit', 'Guardar contraseña')}
                      </PrimaryButton>
                      
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-sm font-semibold text-[#64758B] hover:text-[#1E293B] transition-colors py-2 text-center"
                      >
                        {t('login.back_to_login', 'Volver al inicio de sesión')}
                      </button>
                    </div>

                    {errorMsg && (
                      <p className="text-red-600 text-center text-[13px] mt-4 font-medium pl-1">
                        {errorMsg}
                      </p>
                    )}
                  </Form>
                )}
              </Formik>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
