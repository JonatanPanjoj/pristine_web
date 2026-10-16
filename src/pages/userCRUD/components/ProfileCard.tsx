// src/pages/userCRUD/components/ProfileCard.tsx
import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { setUser } from "../../../store/userSlice";
import { useImageUploader } from "../../../components/uploadImage/hooks/useImageUploader";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { ExitoCard } from "../../../components/ExitoCard";
import { FiCamera, FiEdit2, FiCheck, FiX } from "react-icons/fi";

const ProfileCard: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  const { uploadImage, loading: uploadingImg } = useImageUploader();
  const { updatePhoto, updateFields, loading: savingName } = useUpdateProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return null;
  } // cierra if (!user)

  const initial = user.name?.charAt(0)?.toUpperCase() ?? "?";

  const notify = (ok: boolean, msg: string) => {
    setSuccess(ok);
    setMessage(msg);
    setShowSuccessCard(true);
  }; // cierra const notify

  // ── Foto de perfil ──────────────────────────────────────────────────────────
  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.id) return;
    const result = await uploadImage(file, `profile-${user.id}`);
    if (result?.url) {
      const ok = await updatePhoto(user.id, result.url);
      if (ok) {
        dispatch(setUser({ ...user, url_photo: result.url }));
        notify(true, "Foto de perfil actualizada.");
      } else {
        notify(false, "No se pudo guardar la foto.");
      } // cierra else
    } else {
      notify(false, "No se pudo subir la imagen.");
    } // cierra else
    e.target.value = ""; // permite volver a subir el mismo archivo
  }; // cierra const handleFileChange

  // ── Nombre inline ───────────────────────────────────────────────────────────
  const startEditName = () => {
    setNameDraft(user.name ?? "");
    setEditingName(true);
  }; // cierra const startEditName

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === user.name) {
      setEditingName(false);
      return;
    } // cierra if (!trimmed || trimmed === user.name)
    if (!user.id) return;
    const ok = await updateFields(user.id, { name: trimmed });
    if (ok) {
      dispatch(setUser({ ...user, name: trimmed }));
      setEditingName(false);
      notify(true, "Nombre actualizado.");
    } else {
      notify(false, "No se pudo actualizar el nombre.");
    } // cierra else
  }; // cierra const saveName

  const photoBusy = uploadingImg;

  return (
    <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 flex flex-col items-center text-center">
      {/* Avatar */}
      <div className="relative">
        {user.url_photo ? (
          <img
            src={user.url_photo}
            alt={user.name ?? "Foto de perfil"}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-gray-50 shadow-sm"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-gold to-attention-400 flex items-center justify-center text-white text-4xl font-semibold shadow-sm ring-4 ring-slate-50">
            {initial}
          </div>
        )}

        <button
          onClick={handlePickFile}
          disabled={photoBusy}
          title="Cambiar foto de perfil"
          className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-md ring-2 ring-white transition-colors disabled:opacity-50"
        >
          <FiCamera className="w-4 h-4" />
        </button>

        {photoBusy && (
          <div className="absolute inset-0 rounded-full bg-white/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={handlePickFile}
        disabled={photoBusy}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
      >
        <FiCamera className="w-3.5 h-3.5" />
        {photoBusy ? "Subiendo…" : "Cambiar foto de perfil"}
      </button>

      {/* Nombre */}
      <div className="mt-5 w-full">
        {editingName ? (
          <div className="flex items-center gap-1.5 justify-center">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") setEditingName(false);
              }}
              className="w-full max-w-[200px] px-3 py-1.5 text-center text-base font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
            />
            <button
              onClick={saveName}
              disabled={savingName}
              className="w-7 h-7 shrink-0 rounded-lg bg-success-200/40 text-success-700 hover:bg-success-200/70 flex items-center justify-center"
              title="Guardar"
            >
              <FiCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingName(false)}
              className="w-7 h-7 shrink-0 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              title="Cancelar"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-lg font-bold text-gray-900">
              {user.name || "Sin nombre"}
            </h2>
            <button
              onClick={startEditName}
              className="text-gray-300 hover:text-primary transition-colors"
              title="Editar nombre"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-1">{user.rol_name || "—"}</p>

        <div className="mt-3 flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              user.is_enabled
                ? "bg-success-200/50 text-success-700 border-success-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                user.is_enabled ? "bg-success-500" : "bg-slate-400"
              }`}
            />
            {user.is_enabled ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      {showSuccessCard && (
        <ExitoCard
          onClose={() => setShowSuccessCard(false)}
          loading={uploadingImg || savingName}
          success={success}
          message={message}
        />
      )}
    </div>
  ); // cierra return
}; // cierra const ProfileCard

export default ProfileCard;
