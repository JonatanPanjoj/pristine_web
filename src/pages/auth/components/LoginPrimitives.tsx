import React, { useState } from 'react';
import { useField } from 'formik';
import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  ArrowRightIcon,
  UserIcon
} from 'lucide-react';
import iconoLogin from '../../../assets/img/icono_login.png';

/* Brand logo mark — Pristine */
export function BrandLogo({
  size = 'md',
  invert = false
}: {
  size?: 'sm' | 'md' | 'lg';
  invert?: boolean;
}) {
  const dims = size === 'lg' ? 'h-24' : size === 'sm' ? 'h-8' : 'h-11';
  
  return (
    <img
      src="/img/logo_largo.svg"
      alt="Logo Pristine"
      className={`${dims} w-auto object-contain`}
    />
  );
}

type LoginFieldProps = {
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  icon?: 'mail' | 'lock' | 'user';
};

/* Pill-shaped input field integrated with Formik */
export function LoginField({
  label,
  icon,
  ...props
}: LoginFieldProps) {
  const [field, meta] = useField(props);
  const [show, setShow] = useState(false);
  const isPassword = props.type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : (props.type || 'text');

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={props.name}
        className="block text-[13px] font-medium text-[#64758B] pl-1"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A4B8]">
            {icon === 'user' ? (
              <UserIcon className="h-[18px] w-[18px]" />
            ) : icon === 'mail' ? (
              <MailIcon className="h-[18px] w-[18px]" />
            ) : (
              <LockIcon className="h-[18px] w-[18px]" />
            )}
          </span>
        )}
        <input
          {...field}
          {...props}
          id={props.name}
          type={inputType}
          className={`w-full rounded-full bg-slate-100 text-[14px] text-[#1E293B] placeholder:text-[#94A4B8] py-3 ${
            icon ? 'pl-11' : 'pl-5'
          } ${isPassword ? 'pr-11' : 'pr-5'} outline-none transition-shadow focus:ring-2 focus:ring-[#FCB521]/40`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A4B8] hover:text-[#64758B] transition-colors"
          >
            {show ? (
              <EyeOffIcon className="h-[18px] w-[18px]" />
            ) : (
              <EyeIcon className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>
      {meta.touched && meta.error ? (
        <div className="text-red-600 text-sm mt-1 pl-1">{meta.error}</div>
      ) : null}
    </div>
  );
}

/* Primary gold CTA */
export function PrimaryButton({
  children,
  full = true,
  withArrow = false,
  disabled = false
}: {
  children: React.ReactNode;
  full?: boolean;
  withArrow?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`${
        full ? 'w-full' : ''
      } inline-flex items-center justify-center gap-2 rounded-full bg-[#FCB521] px-8 py-3 font-bold text-sm text-white shadow-[0_4px_12px_rgba(221,152,3,0.25)] transition-all hover:bg-[#FFA700] hover:shadow-[0_6px_18px_rgba(221,152,3,0.35)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
      {withArrow && <ArrowRightIcon className="h-4 w-4" />}
    </button>
  );
}

/* Google SSO button */
export function GoogleButton({
  full = true,
  label = 'Continuar con Google'
}: {
  full?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`${
        full ? 'w-full' : ''
      } inline-flex items-center justify-center gap-2.5 rounded-full bg-white ring-1 ring-slate-200 px-8 py-3 text-sm font-medium text-[#64758B] transition-colors hover:bg-slate-50`}
    >
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {label}
    </button>
  );
}

/* Small "remember me / forgot" row */
export function RememberRow({
  name = 'remember',
  rememberLabel = 'Recordarme',
  forgotLabel = '¿Olvidaste tu contraseña?',
  onForgotClick
}: {
  name?: string;
  rememberLabel?: string;
  forgotLabel?: string;
  onForgotClick?: () => void;
}) {
  const [field] = useField({ name, type: 'checkbox' });

  return (
    <div className="flex items-center justify-between text-[13px] w-full">
      <label className="flex items-center gap-2 text-[#64758B] cursor-pointer select-none">
        <input
          {...field}
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-[#FCB521] focus:ring-[#FCB521]/40"
        />
        {rememberLabel}
      </label>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (onForgotClick) onForgotClick();
        }}
        className="font-medium text-[#FFA700] hover:underline"
      >
        {forgotLabel}
      </a>
    </div>
  );
}

/* Divider with label */
export function OrDivider({ label = 'o continúa con' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-[12px] text-[#94A4B8]">{label}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
