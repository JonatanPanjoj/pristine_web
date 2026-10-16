import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  LoginField,
  PrimaryButton,
  RememberRow
} from "./LoginPrimitives";
import { rememberMeAdapter } from "../adapters/rememberMeAdapter";

const AnimatePresenceComponent: any = AnimatePresence;

interface LoginFormProps {
  onLogin: (user: string, password: string, remember: boolean) => void;
  errorMessage: string; // Esta será la clave de traducción del login
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, errorMessage }) => {
  const { t } = useTranslation(); // Hook para traducción
  const [view, setView] = useState<"login" | "forgot" | "success">("login");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string>("");

  // Esquema de validación usando Yup para el Login
  const loginSchema = Yup.object({
    user: Yup.string().required(t("login.name_required")),
    password: Yup.string().required(t("login.password_required")),
  });

  // Esquema de validación para Recuperación
  const forgotSchema = Yup.object({
    username: Yup.string().required(t("login.username_required", "El nombre de usuario es requerido")),
  });

  const handleForgotSubmit = async (values: { username: string }, { setSubmitting }: any) => {
    setResetError(null);
    try {
      const response = await fetch("https://us-central1-leaguer-2ed58.cloudfunctions.net/requestPasswordReset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: values.username }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al procesar la solicitud");
      }

      setResetSuccessMsg(data.message || "Si el usuario existe, se ha enviado un correo electrónico con las instrucciones.");
      setView("success");
    } catch (err: any) {
      setResetError(err.message || "Error al conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const savedUser = rememberMeAdapter.getRememberedUser();
  const initialValues = {
    user: savedUser,
    password: "",
    remember: !!savedUser
  };

  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresenceComponent mode="wait">
        
        {/* VISTA 1: INICIO DE SESIÓN */}
        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-[#1E293B]">
                {t("login.access_title", "Accede a tu cuenta")}
              </h2>
              <p className="mt-1 text-[13px] text-[#94A4B8]">
                {t("login.access_subtitle", "Usa tus credenciales para continuar")}
              </p>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={loginSchema}
              onSubmit={(values, { setSubmitting }) => {
                onLogin(values.user, values.password, values.remember);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <LoginField
                    name="user"
                    label={t("login.username_label", "Usuario")}
                    type="text"
                    icon="user"
                    placeholder={t("login.username_placeholder")}
                  />

                  <LoginField
                    name="password"
                    label={t("login.password")}
                    type="password"
                    icon="lock"
                    placeholder={t("login.password_placeholder")}
                  />

                  <RememberRow
                    rememberLabel={t("login.remember_me", "Recordarme")}
                    forgotLabel={t("login.forgot_password", "¿Olvidaste tu contraseña?")}
                    onForgotClick={() => setView("forgot")}
                  />

                  <div className="pt-2">
                    <PrimaryButton withArrow disabled={isSubmitting}>
                      {isSubmitting ? t("login.sending") : t("login.submit")}
                    </PrimaryButton>
                  </div>

                  {errorMessage && (
                    <p className="text-red-600 text-center text-[13px] mt-4 font-medium pl-1">
                      {t(errorMessage)}
                    </p>
                  )}
                </Form>
              )}
            </Formik>
          </motion.div>
        )}

        {/* VISTA 2: RECUPERAR CONTRASEÑA */}
        {view === "forgot" && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-[#1E293B]">
                {t("login.forgot_title", "¿Olvidaste tu contraseña?")}
              </h2>
              <p className="mt-1 text-[13px] text-[#94A4B8]">
                {t("login.forgot_subtitle", "Recupera el acceso a tu cuenta")}
              </p>
            </div>

            <Formik
              initialValues={{ username: "" }}
              validationSchema={forgotSchema}
              onSubmit={handleForgotSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="text-left mb-2">
                    <p className="text-[13px] text-[#64758B] leading-relaxed">
                      {t("login.forgot_instructions", "Ingresa tu nombre de usuario y enviaremos un enlace de restablecimiento al correo asociado en tu cuenta.")}
                    </p>
                  </div>

                  <LoginField
                    name="username"
                    label={t("login.username_label", "Usuario")}
                    type="text"
                    icon="user"
                    placeholder={t("login.username_placeholder")}
                  />

                  <div className="pt-4 flex flex-col gap-3">
                    <PrimaryButton withArrow disabled={isSubmitting}>
                      {isSubmitting ? t("login.sending") : t("login.send_link", "Enviar enlace")}
                    </PrimaryButton>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setResetError(null);
                        setView("login");
                      }}
                      className="text-sm font-semibold text-[#64758B] hover:text-[#1E293B] transition-colors py-2 text-center"
                    >
                      {t("login.back_to_login", "Volver al inicio de sesión")}
                    </button>
                  </div>

                  {resetError && (
                    <p className="text-red-600 text-center text-[13px] mt-4 font-medium pl-1">
                      {resetError}
                    </p>
                  )}
                </Form>
              )}
            </Formik>
          </motion.div>
        )}

        {/* VISTA 3: ÉXITO EN EL ENVÍO */}
        {view === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="text-center py-4 space-y-6"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#1E293B]">
                {t("login.email_sent_title", "Enlace enviado")}
              </h3>
              <p className="text-[13px] text-[#64758B] leading-relaxed px-2">
                {resetSuccessMsg}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setView("login")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FCB521] px-8 py-3 font-bold text-sm text-white shadow-[0_4px_12px_rgba(221,152,3,0.25)] transition-all hover:bg-[#FFA700] hover:shadow-[0_6px_18px_rgba(221,152,3,0.35)] active:scale-[0.99]"
              >
                {t("login.back_to_login", "Volver al inicio de sesión")}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresenceComponent>
    </div>
  );
};

export default LoginForm;
