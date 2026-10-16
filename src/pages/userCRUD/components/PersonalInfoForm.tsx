// src/pages/userCRUD/components/PersonalInfoForm.tsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { setUser } from "../../../store/userSlice";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { ExitoCard } from "../../../components/ExitoCard";
import { FiUser, FiSave } from "react-icons/fi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls =
  "w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all placeholder:text-gray-400";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

const PersonalInfoForm: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { updateFields, loading } = useUpdateProfile();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [confirmEmail, setConfirmEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return null;
  } // cierra if (!user)

  const handleSave = async () => {
    if (!name.trim()) {
      setSuccess(false);
      setMessage("El nombre no puede estar vacío.");
      setShowSuccessCard(true);
      return;
    } // cierra if (!name.trim())
    if (!EMAIL_RE.test(email.trim())) {
      setSuccess(false);
      setMessage("Ingresa un correo electrónico válido.");
      setShowSuccessCard(true);
      return;
    } // cierra if (!EMAIL_RE.test)
    if (email.trim() !== confirmEmail.trim()) {
      setSuccess(false);
      setMessage("Los correos electrónicos no coinciden.");
      setShowSuccessCard(true);
      return;
    } // cierra if (email !== confirmEmail)
    if (!user.id) return;

    const fields = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };
    const ok = await updateFields(user.id, fields);
    if (ok) {
      dispatch(setUser({ ...user, ...fields }));
    } // cierra if (ok)
    setSuccess(ok);
    setMessage(
      ok ? "Información personal actualizada." : "No se pudieron guardar los cambios."
    );
    setShowSuccessCard(true);
  }; // cierra const handleSave

  const emailsMismatch =
    confirmEmail.length > 0 && email.trim() !== confirmEmail.trim();

  return (
    <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg bg-primary-gold/10 text-primary-gold flex items-center justify-center">
          <FiUser className="w-4 h-4" />
        </span>
        <h3 className="text-base font-bold text-gray-900">Información personal</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Nombre completo</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre y apellido"
          />
        </div>

        <div>
          <label className={labelCls}>Correo electrónico</label>
          <input
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@empresa.com"
          />
        </div>

        <div>
          <label className={labelCls}>Confirmar correo electrónico</label>
          <input
            type="email"
            className={`${inputCls} ${
              emailsMismatch ? "border-danger-200 ring-2 ring-danger-200/40" : ""
            }`}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Repite tu correo"
          />
          {emailsMismatch && (
            <p className="text-[11px] text-danger-700 mt-1">Los correos no coinciden.</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Teléfono</label>
          <input
            className={inputCls}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Número de contacto"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-full transition-colors disabled:opacity-60"
        >
          <FiSave className="w-4 h-4" />
          {loading ? "Guardando…" : "Guardar cambios"}
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
}; // cierra const PersonalInfoForm

export default PersonalInfoForm;
