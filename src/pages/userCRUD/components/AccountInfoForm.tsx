// src/pages/userCRUD/components/AccountInfoForm.tsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { setUser } from "../../../store/userSlice";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { ExitoCard } from "../../../components/ExitoCard";
import { FiBriefcase, FiSave, FiLock } from "react-icons/fi";

const inputCls =
  "w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all placeholder:text-gray-400";
const readonlyCls =
  "w-full px-4 py-2.5 text-sm text-gray-500 bg-gray-100/70 border border-transparent rounded-xl cursor-not-allowed flex items-center justify-between";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

const AccountInfoForm: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { updateFields, loading, error } = useUpdateProfile();

  const [username, setUsername] = useState(user?.user ?? "");

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return null;
  } // cierra if (!user)

  const handleSave = async () => {
    if (!username.trim()) {
      setSuccess(false);
      setMessage("El nombre de usuario no puede estar vacío.");
      setShowSuccessCard(true);
      return;
    } // cierra if (!username.trim())
    if (!user.id) return;

    const ok = await updateFields(user.id, { user: username.trim() });
    if (ok) {
      dispatch(setUser({ ...user, user: username.trim() }));
    } // cierra if (ok)
    setSuccess(ok);
    setMessage(
      ok
        ? "Información de la cuenta actualizada."
        : error || "No se pudieron guardar los cambios."
    );
    setShowSuccessCard(true);
  }; // cierra const handleSave

  return (
    <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg bg-action-500/10 text-action-500 flex items-center justify-center">
          <FiBriefcase className="w-4 h-4" />
        </span>
        <h3 className="text-base font-bold text-gray-900">Información de la cuenta</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Usuario</label>
          <input
            className={inputCls}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
          />
        </div>

        <div>
          <label className={labelCls}>Rol</label>
          <div className={readonlyCls}>
            <span>{user.rol_name || "—"}</span>
            <FiLock className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            El rol solo puede ser modificado por un administrador.
          </p>
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
}; // cierra const AccountInfoForm

export default AccountInfoForm;
