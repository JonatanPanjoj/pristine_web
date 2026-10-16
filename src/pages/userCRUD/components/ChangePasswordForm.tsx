// src/pages/userCRUD/components/ChangePasswordForm.tsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useChangePassword } from "../hooks/useChangePassword";
import { ExitoCard } from "../../../components/ExitoCard";
import { FiLock, FiEye, FiEyeOff, FiSave, FiCheck, FiX } from "react-icons/fi";

const inputCls =
  "w-full px-4 py-2.5 pr-11 text-sm text-gray-900 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all placeholder:text-gray-400";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

interface Rule {
  label: string;
  test: (v: string) => boolean;
}

const RULES: Rule[] = [
  { label: "Mínimo 8 caracteres", test: (v) => v.length >= 8 },
  { label: "Al menos una letra mayúscula", test: (v) => /[A-Z]/.test(v) },
  { label: "Al menos una letra minúscula", test: (v) => /[a-z]/.test(v) },
  { label: "Al menos un número (0–9)", test: (v) => /\d/.test(v) },
  {
    label: "Al menos un carácter especial (ej: ! @ # $ % & *)",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

const ChangePasswordForm: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const { submit, loading } = useChangePassword();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return null;
  } // cierra if (!user)

  const passed = RULES.filter((r) => r.test(next)).length;
  const strength =
    next.length === 0 ? null : passed <= 2 ? "Baja" : passed <= 4 ? "Media" : "Alta";
  const strengthColor =
    strength === "Alta"
      ? "bg-success-500"
      : strength === "Media"
      ? "bg-attention-500"
      : "bg-danger-500";
  const matches = confirm.length > 0 && next === confirm;
  const allRulesOk = passed === RULES.length;

  const notify = (ok: boolean, msg: string) => {
    setSuccess(ok);
    setMessage(msg);
    setShowSuccessCard(true);
  }; // cierra const notify

  const handleSave = async () => {
    if (!current) {
      notify(false, "Ingresa tu contraseña actual.");
      return;
    } // cierra if (!current)
    if (!allRulesOk) {
      notify(false, "La nueva contraseña no cumple todos los requisitos.");
      return;
    } // cierra if (!allRulesOk)
    if (next !== confirm) {
      notify(false, "Las contraseñas no coinciden.");
      return;
    } // cierra if (next !== confirm)
    if (!user.id || !user.user) {
      notify(false, "No se pudo identificar al usuario.");
      return;
    } // cierra if (!user.id || !user.user)

    const result = await submit(user.id, user.user, current, next);
    if (result) {
      setCurrent("");
      setNext("");
      setConfirm("");
      notify(true, "Contraseña actualizada correctamente.");
    } else {
      notify(false, "La contraseña actual no es correcta o hubo un error.");
    } // cierra else
  }; // cierra const handleSave

  const EyeBtn: React.FC<{ shown: boolean; toggle: () => void }> = ({
    shown,
    toggle,
  }) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      {shown ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <FiLock className="w-4 h-4" />
        </span>
        <h3 className="text-base font-bold text-gray-900">Contraseña</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {/* Campos */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Contraseña actual</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className={inputCls}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••"
              />
              <EyeBtn shown={showCurrent} toggle={() => setShowCurrent((p) => !p)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Contraseña nueva</label>
            <div className="relative">
              <input
                type={showNext ? "text" : "password"}
                className={inputCls}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="••••••••"
              />
              <EyeBtn shown={showNext} toggle={() => setShowNext((p) => !p)} />
            </div>

            {strength && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthColor} transition-all duration-300`}
                    style={{ width: `${(passed / RULES.length) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Fuerza de contraseña:{" "}
                  <span className="font-semibold text-gray-700">{strength}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className={`${inputCls} ${
                  confirm.length > 0 && !matches
                    ? "border-danger-200 ring-2 ring-danger-200/40"
                    : ""
                }`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
              <EyeBtn shown={showConfirm} toggle={() => setShowConfirm((p) => !p)} />
            </div>
            {confirm.length > 0 && (
              <p
                className={`text-[11px] mt-1 ${
                  matches ? "text-success-700" : "text-danger-700"
                }`}
              >
                {matches
                  ? "Las contraseñas coinciden."
                  : "Las contraseñas no coinciden."}
              </p>
            )}
          </div>
        </div>

        {/* Requisitos */}
        <div className="md:pt-1">
          <p className="text-xs font-semibold text-gray-500 mb-3">
            Requisitos de seguridad
          </p>
          <ul className="space-y-2">
            {RULES.map((rule) => {
              const ok = rule.test(next);
              return (
                <li key={rule.label} className="flex items-start gap-2 text-xs">
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      ok
                        ? "bg-success-200/50 text-success-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {ok ? <FiCheck className="w-3 h-3" /> : <FiX className="w-3 h-3" />}
                  </span>
                  <span className={ok ? "text-gray-700" : "text-gray-400"}>
                    {rule.label}
                  </span>
                </li>
              ); // cierra return
            })}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors disabled:opacity-60"
        >
          <FiSave className="w-4 h-4" />
          {loading ? "Guardando…" : "Guardar datos"}
        </button>
      </div>

      {showSuccessCard && (
        <ExitoCard
          onClose={() => setShowSuccessCard(false)}
          loading={loading}
          success={success}
          message={message}
        />
      )}
    </div>
  ); // cierra return
}; // cierra const ChangePasswordForm

export default ChangePasswordForm;
