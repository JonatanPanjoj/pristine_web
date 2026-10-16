// src/pages/CategoryChecklistCrud/components/CategoriaForm.tsx
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { FaSave, FaEdit, FaEraser } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { FiGrid } from 'react-icons/fi';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Categoria_Checklist } from '../../../models/Categoria_Checklist';
import useCreateCategoriaChecklist from '../hooks/useCreateCategoriaChecklist';
import { useEditCategoriaChecklist } from '../hooks/useEditCategoriaChecklist';
import { ExitoCard } from '../../../components/ExitoCard';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

interface CategoriaFormProps {
  categoria?: Categoria_Checklist;
  disabled?: boolean;
  onSuccess?: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const fieldBase =
  'w-full bg-slate-100/80 border-0 rounded-full px-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-gold/40';
const fieldDisabled = 'bg-slate-100 text-slate-400 cursor-not-allowed';

const PRESET_COLORS = [
  '#2D3C49',
  '#0067FF',
  '#6066E7',
  '#34AB45',
  '#F1A604',
  '#DA1E37',
  '#FE4A23',
  '#7693A7',
];

const CategoriaForm: React.FC<CategoriaFormProps> = ({
  categoria,
  disabled = false,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { addNewCategoriaChecklist, loading: createLoading, error: createError } =
    useCreateCategoriaChecklist();
  const { editCategoriaChecklist, loading: editLoading, error: editError } =
    useEditCategoriaChecklist();

  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const userId = useSelector((state: RootState) => state.user.user?.id);

  const title = categoria ? (disabled ? 'Ver Categoría' : 'Editar Categoría') : 'Crear Categoría';

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-white rounded-[32px] p-6 md:p-8 border-0"
      >
        {/* Cabecera */}
        <div className="flex items-center mb-6">
          <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
            <FiGrid className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="text-xs text-slate-400">Detalles de la categoría de checklist.</p>
          </div>
        </div>

        <Formik
          initialValues={{
            name: categoria?.name || '',
            color: categoria?.color || '#2D3C49',
            is_enabled: categoria?.is_enabled ?? true,
          }}
          enableReinitialize
          validationSchema={Yup.object({
            name: Yup.string().required(t('categoriaForm.validation.required')),
            color: Yup.string()
              .matches(/^#[0-9A-Fa-f]{6}$/, t('categoriaForm.validation.color'))
              .required(t('categoriaForm.validation.required')),
            is_enabled: Yup.boolean(),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);

            const categoriaData = {
              ...values,
              user_registro: userId,
            };

            if (categoria) {
              await editCategoriaChecklist({ ...categoria, ...categoriaData });
            } else {
              await addNewCategoriaChecklist(categoriaData);
            }

            setSubmitting(false);
            setSuccess(true);
            setMessage(categoria ? 'Categoría editada con éxito.' : 'Categoría creada con éxito.');
            setShowSuccessCard(true);
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched, resetForm }) => (
            <Form className="space-y-6">
              {/* Nombre de categoría */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                  {t('categoriaForm.form.name')}
                  <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  disabled={disabled}
                  value={values.name}
                  onChange={(e) => setFieldValue('name', e.target.value)}
                  placeholder="Ej: Seguridad"
                  className={`${fieldBase} ${
                    touched.name && errors.name ? 'border border-rose-500' : ''
                  } ${disabled ? fieldDisabled : ''}`}
                />
                {touched.name && errors.name && (
                  <div className="text-rose-500 text-xs mt-1 ml-1">{errors.name}</div>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                  {t('categoriaForm.form.color')}
                  <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="colorPicker"
                    disabled={disabled}
                    value={values.color}
                    onChange={(e) => setFieldValue('color', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer disabled:cursor-not-allowed p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    name="color"
                    disabled={disabled}
                    value={values.color}
                    onChange={(e) => setFieldValue('color', e.target.value)}
                    className={`flex-1 ${fieldBase} ${
                      touched.color && errors.color ? 'border border-rose-500' : ''
                    } ${disabled ? fieldDisabled : ''}`}
                    placeholder="#2D3C49"
                  />
                </div>

                {/* Swatches de acceso rápido */}
                {!disabled && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {PRESET_COLORS.map((c) => {
                      const isActive = values.color.toLowerCase() === c.toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFieldValue('color', c)}
                          aria-label={`Usar color ${c}`}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full transition-all active:scale-90 ${
                            isActive
                              ? 'ring-2 ring-offset-2 ring-primary-gold'
                              : 'ring-1 ring-slate-200 hover:scale-110'
                          }`}
                        />
                      );
                    })}
                  </div>
                )}

                {touched.color && errors.color && (
                  <div className="text-rose-500 text-xs mt-1 ml-1">{errors.color}</div>
                )}
              </div>

              {/* Vista Previa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                  Vista previa
                </label>
                <div className="flex items-center gap-3 bg-slate-100/80 rounded-full px-4 py-2.5">
                  <span
                    className="w-4 h-4 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: values.color }}
                  />
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {values.name || 'Nombre de la categoría'}
                  </span>
                </div>
              </div>

              {!disabled && (
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    disabled={isSubmitting || (categoria ? editLoading : createLoading)}
                    className="flex items-center gap-2 rounded-full px-8 py-3 font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaEraser className="w-4 h-4" />
                    <span>Limpiar</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || (categoria ? editLoading : createLoading)}
                    className="flex items-center gap-2 rounded-full px-8 py-3 font-bold text-sm text-white bg-primary-dark hover:opacity-90 shadow-[0_4px_12px_rgba(32,43,52,0.25)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || (categoria ? editLoading : createLoading) ? (
                      <MdRefresh className="animate-spin w-5 h-5" />
                    ) : categoria ? (
                      <>
                        <FaEdit className="w-4 h-4" />
                        <span>Editar Categoría</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        <span>Guardar Categoría</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {(createError || editError) && (
                <div className="text-rose-500 text-sm text-center">{createError || editError}</div>
              )}
            </Form>
          )}
        </Formik>
      </motion.div>

      {showSuccessCard && (
        <ExitoCard
          onClose={() => {
            setShowSuccessCard(false);
            if (success && onSuccess) onSuccess();
          }}
          loading={createLoading || editLoading}
          success={success}
          message={message}
        />
      )}
    </>
  );
};

export default CategoriaForm;
