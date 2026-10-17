import React from 'react';
import { useLogin } from '../hooks/useLogin';
import LoginForm from '../components/loginForm';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '../components/LoginPrimitives';
import { motion } from 'framer-motion';
import loginBg from '../../../assets/img/login_bg.png';

const Login: React.FC = () => {
  const { isLoggedIn, errorMessage, login } = useLogin();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen w-full bg-[#F6F7FD] flex items-center justify-center px-4 py-8 sm:px-6 overflow-hidden">
      
      {/* Círculos decorativos animados en toda la pantalla (Asíncronos) */}
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
      
      {/* Par adicional de círculos (otros tamaños y posiciones) */}
      <motion.div
        className="pointer-events-none absolute left-12 -bottom-10 h-32 w-32 rounded-full bg-[#389CD6]/10 sm:h-40 sm:w-40"
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 11, delay: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute left-[30%] -top-8 h-12 w-12 rounded-full bg-[#389CD6]/20 sm:h-16 sm:w-16"
        aria-hidden="true"
        animate={{ scale: [1, 1.16, 1] }}
        transition={{ duration: 6, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />


      {/* Layout principal asimétrico y centrado */}
      <div className="relative w-full max-w-6xl mx-auto bg-white/80 backdrop-blur-xl rounded-[40px] shadow-[0_24px_70px_rgba(0,0,0,0.07)] border border-white/40 p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 z-10">
        
        {/* Lado Izquierdo: Imagen de fondo con Overlay y Textos */}
        <div className="relative hidden lg:flex w-1/2 min-h-[620px] rounded-[32px] overflow-hidden flex-col justify-end p-12 text-white">
          {/* Imagen de fondo */}
          <img 
            src={loginBg} 
            alt="Workspace" 
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />
          {/* Overlay negro con opacidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 mix-blend-multiply" />
          
          {/* Textos sobre la imagen en la parte inferior centrada */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto w-full">
            <h1 className="text-[32px] sm:text-[38px] font-bold leading-[1.2] tracking-tight text-white">
              {t("login.hero_title_1", "Todo tu soporte,")}
              <br />
              <span className="text-[#389CD6]">{t("login.hero_title_2", "en un solo lugar.")}</span>
            </h1>
            
            <p className="mt-4 text-[14px] leading-relaxed text-slate-300">
              {t("login.hero_description", "Accede a tu espacio de trabajo para dar seguimiento a tickets, técnicos y reportes en tiempo real.")}
            </p>
          </div>
        </div>

        {/* Lado Derecho: Formulario de Inicio de Sesión */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center py-6 px-2 sm:px-6 lg:px-8">
          <div className="w-full max-w-[420px] mx-auto lg:mx-0">
            {/* Logo grande y centrado arriba del formulario */}
            <div className="mb-8 flex justify-center">
              <BrandLogo size="lg" />
            </div>
            
            {isLoggedIn ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </motion.div>
                <p className="text-green-600 font-semibold text-lg">
                  {t("login.success", "¡Inicio de sesión exitoso!")}
                </p>
              </div>
            ) : (
              <LoginForm onLogin={login} errorMessage={errorMessage} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
