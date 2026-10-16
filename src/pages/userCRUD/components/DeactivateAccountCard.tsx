// src/pages/userCRUD/components/DeactivateAccountCard.tsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../store/store";
import { resetState } from "../../../store/userSlice";
import { useDeactivateAccount } from "../hooks/useDeactivateAccount";
import { ExitoCard } from "../../../components/ExitoCard";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { FiAlertTriangle, FiSlash } from "react-icons/fi";

const DeactivateAccountCard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const { deactivate, loading } = useDeactivateAccount();

  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return null;
  } // cierra if (!user)

  const handleConfirm = async () => {
    if (!user.id) return;
    const ok = await deactivate(user.id);
    setConfirmOpen(false);
    if (ok) {
      // Cierra sesión y limpia el estado de Redux
      dispatch(resetState());
      navigate("/login");
    } else {
      setSuccess(false);
      setMessage("No se pudo desactivar la cuenta.");
      setShowSuccessCard(true);
    } // cierra else
  }; // cierra const handleConfirm

  return (
    <div className="bg-white rounded-[24px] border border-danger-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-8 h-8 rounded-lg bg-danger-200/40 text-danger-700 flex items-center justify-center">
          <FiAlertTriangle className="w-4 h-4" />
        </span>
        <h3 className="text-base font-bold text-gray-900">Desactivar cuenta</h3>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed mb-5">
        Tu cuenta se inactivará y se cerrará tu sesión. No podrás iniciar sesión
        hasta que un administrador la reactive.
      </p>

      <button
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-danger-500 hover:bg-danger-700 rounded-full transition-colors disabled:opacity-60"
      >
        <FiSlash className="w-4 h-4" />
        {loading ? "Desactivando…" : "Desactivar mi cuenta"}
      </button>

      <ConfirmationModal
        isOpen={confirmOpen}
        message="¿Seguro que quieres desactivar tu cuenta? Se cerrará tu sesión de inmediato."
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

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
}; // cierra const DeactivateAccountCard

export default DeactivateAccountCard;
