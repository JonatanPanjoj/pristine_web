// src/pages/CheckListManagerListPrograming/components/ChecklistForm.tsx
import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { FaSave, FaEdit } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { FiX, FiClipboard } from 'react-icons/fi';
import * as Yup from 'yup';
import FormInput from '../../../components/FormInput';
import { Checklist } from '../../../models/Checklist';
import useCreateChecklist from '../hooks/useCreateChecklist';
import { useEditChecklist } from '../hooks/useEditChecklist';
import { ExitoCard } from '../../../components/ExitoCard';
import fetchCategorias from '../../../components/CategoryChecklist/hooks/fetchCategorias';

interface ChecklistFormProps {
  checklist?: Checklist;
  onClose?: () => void;
  onSaved?: () => void;
}

const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-primary-gold' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
    <span className="text-xs font-bold text-slate-700">{label}</span>
  </div>
);

const ChecklistForm: React.FC<ChecklistFormProps> = ({ checklist, onClose, onSaved }) => {
  const { addNewChecklist, loading: createLoading, error: createError } = useCreateChecklist();
  const { editChecklist, loading: editLoading, error: editError } = useEditChecklist();

  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const isEdit = Boolean(checklist);

  useEffect(() => {
    fetchCategorias().then(({ categorias, error }) => {
      if (error) console.error(error);
      else if (categorias) setCategories(categorias);
    });
  }, []);

  return (
    <>
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 flex flex-col gap-5 w-full border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
              <FiClipboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isEdit ? 'Editar lista de chequeo' : 'Agregar lista de chequeo'}
              </h2>
              <p className="text-xs text-slate-400">Define los parámetros del cuestionario de auditoría.</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX size={18} />
            </button>
          )}
        </div>

        <Formik
          enableReinitialize
          initialValues={{
            name: checklist?.name ?? '',
            categoryId: checklist?.categoryId ?? '',
            categoryName: checklist?.categoryName ?? '',
            needPhoto: checklist?.needPhoto ?? false,
            needFirm: checklist?.needFirm ?? false,
            isEnabled: checklist?.isEnabled ?? true,
            questions: checklist?.questions ?? [],
            createdAt: checklist?.createdAt ?? new Date().toISOString(),
            updatedAt: checklist?.updatedAt ?? new Date().toISOString(),
          }}
          validationSchema={Yup.object({
            name: Yup.string().required('Este campo es requerido'),
            categoryId: Yup.string().required('Este campo es requerido'),
          })}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            const selectedCategory = categories.find((c) => c.id === values.categoryId);
            const data: Omit<Checklist, 'id'> = {
              ...values,
              categoryName: selectedCategory?.name ?? values.categoryName,
              updatedAt: new Date().toISOString(),
            };

            setSubmitting(true);
            let result: { success: boolean };

            if (isEdit && checklist) {
              await editChecklist({ ...checklist, ...data });
              result = { success: true };
            } else {
              result = await addNewChecklist(data);
            }

            setSubmitting(false);

            if (result.success) {
              setSuccess(true);
              setMessage(isEdit ? 'Checklist editado con éxito.' : 'Checklist creado con éxito.');
              setShowSuccessCard(true);
              if (!isEdit) resetForm();
              onSaved?.();
            } else {
              setSuccess(false);
              setMessage('Ocurrió un error. Intenta de nuevo.');
              setShowSuccessCard(true);
            }
          }}
        >
          {({ isSubmitting, setFieldValue, values, resetForm }) => (
            <Form className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">
                    Nombre o Título <span className="text-rose-500">*</span>
                  </label>
                  <FormInput label="" name="name" textColor="text-slate-800" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">
                    Categoría <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={values.categoryId}
                    onChange={(e) => setFieldValue('categoryId', e.target.value)}
                    className="w-full py-2.5 px-4 text-xs font-semibold bg-slate-100/80 border-0 rounded-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all cursor-pointer"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-8 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                <Toggle
                  checked={values.needPhoto}
                  onChange={(v) => setFieldValue('needPhoto', v)}
                  label="¿Requiere foto?"
                />
                <Toggle
                  checked={values.needFirm}
                  onChange={(v) => setFieldValue('needFirm', v)}
                  label="¿Requiere firma?"
                />
              </div>

              {(createError || editError) && (
                <p className="text-xs text-rose-500 text-center">{createError || editError}</p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => resetForm()}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (isEdit ? editLoading : createLoading)}
                  className="flex items-center gap-2 rounded-full px-8 py-3 font-bold text-sm text-white bg-primary-dark hover:opacity-90 shadow-[0_4px_12px_rgba(32,43,52,0.25)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || (isEdit ? editLoading : createLoading) ? (
                    <MdRefresh className="animate-spin h-4 w-4" />
                  ) : isEdit ? (
                    <>
                      <FaEdit size={13} /> Guardar cambios
                    </>
                  ) : (
                    <>
                      <FaSave size={13} /> Guardar datos
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {showSuccessCard && (
        <ExitoCard
          onClose={() => setShowSuccessCard(false)}
          loading={createLoading || editLoading}
          success={success}
          message={message}
        />
      )}
    </>
  );
};

export default ChecklistForm;
