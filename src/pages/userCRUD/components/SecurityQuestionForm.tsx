// src/pages/userCRUD/components/SecurityQuestionForm.tsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { setUser } from "../../../store/userSlice";
import { useSecurityQuestion } from "../hooks/useSecurityQuestion";
import { ExitoCard } from "../../../components/ExitoCard";
import { FiHelpCircle, FiSave, FiEye, FiEyeOff } from "react-icons/fi";

const inputCls =
  "w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all placeholder:text-gray-400";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

const PRESET_QUESTIONS = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es el segundo nombre de tu madre?",
  "¿Cuál fue tu primer colegio?",
  "¿Cuál es tu comida favorita?",
  "Otra (escribir mi propia pregunta)",
];

const SecurityQuestionForm: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { submit, loading } = useSecurityQuestion();

  const savedIsPreset =
    user?.personal_question && PRESET_QUESTIONS.includes(user.personal_question);
  const [selected, setSelected] = useState(
    savedIsPreset
      ? (user?.personal_question as string)
      : user?.personal_question
      ? PRESET_QUESTIONS[5]
      : PRESET_QUESTIONS[0]
  );
  const [customQuestion, setCustomQuestion] = useState(
    savedIsPreset ? "" : user?.personal_question ?? ""
  );
  const [answer, setAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) {
    return null;
  } // cierra if (!user)

  const isCustom = selected === PRESET_QUESTIONS[5];
  const finalQuestion = isCustom ? customQuestion.trim() : selected;

  const notify = (ok: boolean, msg: string) => {
    setSuccess(ok);
    setMessage(msg);
    setShowSuccessCard(true);
  }; // cierra const notify

  const handleSave = async () => {
    if (!finalQuestion) {
      notify(false, "Escribe tu pregunta secreta.");
      return;
    } // cierra if (!finalQuestion)
    if (!answer.trim()) {
      notify(false, "Ingresa la respuesta secreta.");
      return;
    } // cierra if (!answer.trim())
    if (!user.id || !user.user) {
      notify(false, "No se pudo identificar al usuario.");
      return;
    } // cierra if (!user.id || !user.user)

    const ok = await submit(user.id, user.user, finalQuestion, answer.trim());
    if (ok) {
      dispatch(setUser({ ...user, personal_question: finalQuestion }));
      setAnswer("");
    } // cierra if (ok)
    notify(
      ok,
      ok ? "Pregunta secreta actualizada." : "No se pudo guardar la pregunta secreta."
    );
  }; // cierra const handleSave

  return (
    <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
          <FiHelpCircle className="w-4 h-4" />
        </span>
        <h3 className="text-base font-bold text-gray-900">Pregunta secreta</h3>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Se usa para recuperar tu cuenta. Por seguridad, la respuesta guardada no se
        muestra; vuelve a escribirla cada vez que la actualices.
      </p>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Pregunta</label>
          <select
            className={`${inputCls} appearance-none`}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {PRESET_QUESTIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        {isCustom && (
          <div>
            <label className={labelCls}>Tu pregunta personalizada</label>
            <input
              className={inputCls}
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Escribe tu propia pregunta"
            />
          </div>
        )}

        <div>
          <label className={labelCls}>Respuesta</label>
          <div className="relative">
            <input
              type={showAnswer ? "text" : "password"}
              className={`${inputCls} pr-11`}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={
                user.personal_answer
                  ? "•••••••• (escribe para reemplazar)"
                  : "Tu respuesta"
              }
            />
            <button
              type="button"
              onClick={() => setShowAnswer((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showAnswer ? (
                <FiEyeOff className="w-4 h-4" />
              ) : (
                <FiEye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-full transition-colors disabled:opacity-60"
        >
          <FiSave className="w-4 h-4" />
          {loading ? "Guardando…" : "Guardar pregunta"}
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
}; // cierra const SecurityQuestionForm

export default SecurityQuestionForm;
