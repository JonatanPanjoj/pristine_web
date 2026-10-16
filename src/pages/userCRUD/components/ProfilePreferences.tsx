// src/pages/userCRUD/components/ProfilePreferences.tsx
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { setUser } from "../../../store/userSlice";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { ExitoCard } from "../../../components/ExitoCard";
import { ChangeLanguageUseCase } from "../../../i18n/application/ChangeLanguageUseCase";
import { FiBell, FiMoon, FiGlobe, FiChevronDown } from "react-icons/fi";

// ── Switch reutilizable ───────────────────────────────────────────────────────
const Switch: React.FC<{
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    disabled={disabled}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 ${
      checked ? "bg-primary" : "bg-slate-300"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
); // cierra const Switch

const LANGS: Record<string, string> = { es: "Español", en: "English" };

const ProfilePreferences: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { updateFields, loading } = useUpdateProfile();

  const [darkMode, setDarkMode] = useState(false); // Solo UI local — no toca BD
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      } // cierra if
    }; // cierra const onClickOutside
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []); // cierra useEffect

  if (!user) {
    return null;
  } // cierra if (!user)

  const currentLang = user.language && LANGS[user.language] ? user.language : "es";

  const notify = (ok: boolean, msg: string) => {
    setSuccess(ok);
    setMessage(msg);
    setShowSuccessCard(true);
  }; // cierra const notify

  // ── Notificaciones (escribe a BD) ──
  const toggleNotifications = async () => {
    const next = !user.notifications_enabled;
    if (!user.id) return;
    const ok = await updateFields(user.id, { notifications_enabled: next });
    if (ok) {
      dispatch(setUser({ ...user, notifications_enabled: next }));
    } // cierra if (ok)
    notify(
      ok,
      ok
        ? next
          ? "Notificaciones activadas."
          : "Notificaciones desactivadas."
        : "No se pudo actualizar las notificaciones."
    );
  }; // cierra const toggleNotifications

  // ── Idioma (escribe a BD) ──
  const handleLanguageChange = async (lang: string) => {
    setLangOpen(false);
    if (lang === currentLang) return;

    ChangeLanguageUseCase.execute(lang); // cambia i18n en caliente
    if (!user.id) return;
    const ok = await updateFields(user.id, { language: lang });
    if (ok) {
      dispatch(setUser({ ...user, language: lang }));
    } // cierra if (ok)
    notify(
      ok,
      ok ? `Idioma cambiado a ${LANGS[lang]}.` : "No se pudo actualizar el idioma."
    );
  }; // cierra const handleLanguageChange

  return (
    <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Preferencias</h3>

      <div className="space-y-1">
        {/* Notificaciones */}
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary-gold/10 text-primary-gold flex items-center justify-center">
              <FiBell className="w-4 h-4" />
            </span>
            <span className="text-sm text-gray-700">Notificaciones</span>
          </div>
          <Switch
            checked={!!user.notifications_enabled}
            onChange={toggleNotifications}
            disabled={loading}
          />
        </div>

        {/* Modo oscuro (local, no toca BD → sin ExitoCard) */}
        <div className="flex items-center justify-between py-2.5 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
              <FiMoon className="w-4 h-4" />
            </span>
            <span className="text-sm text-gray-700">Modo oscuro</span>
          </div>
          <Switch checked={darkMode} onChange={() => setDarkMode((p) => !p)} />
        </div>

        {/* Idioma */}
        <div className="flex items-center justify-between py-2.5 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-action-500/10 text-action-500 flex items-center justify-center">
              <FiGlobe className="w-4 h-4" />
            </span>
            <span className="text-sm text-gray-700">Idioma</span>
          </div>

          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((p) => !p)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {LANGS[currentLang]}
              <FiChevronDown className="w-3.5 h-3.5" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                {Object.entries(LANGS).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${
                      code === currentLang
                        ? "text-primary font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
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
}; // cierra const ProfilePreferences

export default ProfilePreferences;