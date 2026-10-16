import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { FaSave } from 'react-icons/fa';
import { MdRefresh, MdDelete } from 'react-icons/md';
import { FiX, FiHelpCircle, FiEdit2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import * as Yup from 'yup';
import FormInput from '../../../components/FormInput';
import ReportCard from '../../../components/ReportCard';
import useCreateQuestion from '../hooks/questions/useCreateQuestion';
import useEnabledQuestions from '../hooks/questions/useEnabledQuestions';
import { useToggleQuestionStatus } from '../hooks/questions/useToggleQuestionStatus';
import { useEditQuestion } from '../hooks/questions/useEditQuestion';
import { ChecklistQuestion } from '../../../models/ChecklistQuestion';
import { ExitoCard } from '../../../components/ExitoCard';
import ModalPortal from '../../../components/ModalPortal';

interface QuestionFormProps { checklistId: string; }

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-2">
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary-gold' : 'bg-slate-200'}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
    <span className="text-sm font-semibold text-slate-600">{label}</span>
  </div>
);

const GOLD_BTN = 'flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-primary-gold hover:opacity-95 text-white shadow-[0_4px_12px_rgba(221,152,3,0.25)] transition-all active:scale-95 disabled:opacity-50';

const QuestionForm: React.FC<QuestionFormProps> = ({ checklistId }) => {
  const { addNewQuestion, loading: createLoading } = useCreateQuestion();
  const { questions, loading: questionsLoading, error: questionsError } = useEnabledQuestions(checklistId);
  const { toggleStatus, loading: toggleLoading } = useToggleQuestionStatus();
  const { editQuestion, loading: editLoading } = useEditQuestion();

  const [localQuestions,  setLocalQuestions]  = useState<ChecklistQuestion[]>([]);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [message,         setMessage]         = useState('');
  const [editModalOpen,   setEditModalOpen]   = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<ChecklistQuestion | null>(null);

  useEffect(() => { if (questions) setLocalQuestions(questions); }, [questions]);

  const handleDelete = async (id: string) => {
    const result = await toggleStatus(checklistId, id);
    if (result) {
      setLocalQuestions(prev => prev.filter(q => q.id !== id));
      setSuccess(true); setMessage('Pregunta eliminada.'); setShowSuccessCard(true);
    }
  };

  const handleEditSubmit = async (values: Partial<Omit<ChecklistQuestion, 'id'>>) => {
    if (!currentQuestion) return;
    const result = await editQuestion(checklistId, currentQuestion.id, values);
    if (result.success) {
      setLocalQuestions(prev => prev.map(q => q.id === currentQuestion.id ? { ...q, ...values } : q));
      setEditModalOpen(false);
      setSuccess(true); setMessage(result.message); setShowSuccessCard(true);
    }
  };

  const cellCls = 'bg-[#FAFAFA] py-2.5 px-4 text-sm text-slate-700 group-hover:bg-white transition-colors';

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* ── Form ── */}
      <ReportCard title="Nueva pregunta">
        <Formik
          initialValues={{ questionText: '', order: localQuestions.length + 1, isEnabled: true, requiresPhoto: false }}
          validationSchema={Yup.object({ questionText: Yup.string().required('Requerido') })}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            try {
              const result = await addNewQuestion(checklistId, { ...values, type: 'binary', order: localQuestions.length + 1 });
              if (result.success && result.newQuestion) {
                setLocalQuestions(prev => [...prev, result.newQuestion!]);
                setSuccess(true); setMessage('Pregunta creada con éxito.'); setShowSuccessCard(true);
                resetForm();
              }
            } catch { setSuccess(false); setMessage('Error al crear la pregunta.'); setShowSuccessCard(true); }
            finally { setSubmitting(false); }
          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Pregunta <span className="text-danger-500">*</span></label>
                <FormInput label="" name="questionText" textColor="text-slate-800" />
              </div>
              <div className="flex items-center justify-between">
                <Toggle checked={values.requiresPhoto} onChange={v => setFieldValue('requiresPhoto', v)} label="Requiere foto" />
                <button type="submit" disabled={isSubmitting || createLoading} className={GOLD_BTN}>
                  {isSubmitting || createLoading ? <MdRefresh className="animate-spin h-4 w-4" /> : <><FaSave size={12} /> Guardar pregunta</>}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </ReportCard>

      {/* ── Tabla de preguntas ── */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 border-spacing-x-0">
            <thead>
              <tr>
                <th className="bg-primary-gold text-white font-bold text-xs uppercase tracking-wider py-2 px-4 first:rounded-l-full w-10">#</th>
                <th className="bg-primary-gold text-white font-bold text-xs uppercase tracking-wider py-2 px-4">Pregunta</th>
                <th className="bg-primary-gold text-white font-bold text-xs uppercase tracking-wider py-2 px-4 text-center">Foto</th>
                <th className="bg-primary-gold text-white font-bold text-xs uppercase tracking-wider py-2 px-4 text-right last:rounded-r-full">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {questionsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="bg-[#FAFAFA] py-2.5 px-4 first:rounded-l-full"><div className="h-3 bg-neutral-200 rounded w-4" /></td>
                    <td className="bg-[#FAFAFA] py-2.5 px-4"><div className="h-4 bg-neutral-200 rounded w-48" /></td>
                    <td className="bg-[#FAFAFA] py-2.5 px-4"><div className="h-5 bg-neutral-200 rounded-full w-8 mx-auto" /></td>
                    <td className="bg-[#FAFAFA] py-2.5 px-4 last:rounded-r-full"><div className="h-7 bg-neutral-200 rounded-lg w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : questionsError ? (
                <tr><td colSpan={4} className="py-8 text-center text-sm text-danger-700">{questionsError}</td></tr>
              ) : localQuestions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <FiHelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Sin preguntas aún</p>
                    <p className="text-xs text-slate-400 mt-1">Agrega la primera pregunta usando el formulario de arriba.</p>
                  </td>
                </tr>
              ) : (
                localQuestions.map((q, idx) => (
                  <motion.tr key={q.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="group">
                    <td className={`${cellCls} first:rounded-l-full text-xs text-slate-400 font-bold`}>{idx + 1}</td>
                    <td className={`${cellCls} font-medium text-slate-800`}>{q.questionText}</td>
                    <td className={`${cellCls} text-center`}>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${q.requiresPhoto ? 'bg-primary-gold/10 text-primary-gold' : 'bg-slate-100 text-slate-400'}`}>
                        {q.requiresPhoto ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className={`${cellCls} last:rounded-r-full`}>
                      <div className="flex justify-end items-center gap-1.5">
                        <button onClick={() => { setCurrentQuestion(q); setEditModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-primary-gold hover:bg-primary-gold/10 rounded-lg transition-colors active:scale-95" title="Editar">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(q.id)}
                          className="p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-200/30 rounded-lg transition-colors active:scale-95" title="Eliminar">
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!questionsLoading && localQuestions.length > 0 && (
          <div className="px-2 pt-3 mt-2 border-t border-slate-100 text-sm text-slate-500">
            {localQuestions.length} {localQuestions.length === 1 ? 'pregunta' : 'preguntas'}
          </div>
        )}
      </div>

      {editModalOpen && currentQuestion && (
        <QuestionEditModal question={currentQuestion} onClose={() => setEditModalOpen(false)} onSubmit={handleEditSubmit} loading={editLoading} />
      )}
      {showSuccessCard && (
        <ExitoCard onClose={() => setShowSuccessCard(false)} loading={createLoading || toggleLoading || editLoading} success={success} message={message} />
      )}
    </div>
  );
};

export default QuestionForm;

// ── Edit modal ────────────────────────────────────────────────────────────────
const QuestionEditModal: React.FC<{
  question: ChecklistQuestion; onClose: () => void;
  onSubmit: (v: Partial<Omit<ChecklistQuestion, 'id'>>) => void; loading?: boolean;
}> = ({ question, onClose, onSubmit, loading }) => (
  <ModalPortal>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Editar pregunta</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><FiX size={16} /></button>
        </div>
        <Formik
          initialValues={{ questionText: question.questionText, requiresPhoto: question.requiresPhoto }}
          validationSchema={Yup.object({ questionText: Yup.string().required('Requerido') })}
          onSubmit={values => onSubmit({ ...values, type: 'binary' })}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Pregunta <span className="text-danger-500">*</span></label>
                <FormInput label="" name="questionText" textColor="text-slate-800" />
              </div>
              <Toggle checked={values.requiresPhoto} onChange={v => setFieldValue('requiresPhoto', v)} label="Requiere foto" />
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95">Cancelar</button>
                <button type="submit" disabled={isSubmitting || loading} className={GOLD_BTN}>
                  {isSubmitting || loading ? <MdRefresh className="animate-spin h-4 w-4" /> : <><FaSave size={12} /> Guardar</>}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  </ModalPortal>
);
