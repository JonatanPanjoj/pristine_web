import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { FaSave, FaEdit, FaEraser } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { FiChevronDown, FiGrid } from 'react-icons/fi';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sector } from '../../../models/Sector';
import useCreateSector from '../hooks/useCreateSector';
import { useEditSector } from '../hooks/useEditSector';
import { ExitoCard } from '../../../components/ExitoCard';
import useEnabledSedesFromCache from '../../../publicHooks/sedesEnabled/hooks/useEnabledSedesFromCache';

interface SectorFormProps {
  sector?: Sector;
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

const SectorForm: React.FC<SectorFormProps> = ({ sector, disabled = false, onSuccess }) => {
  const { t } = useTranslation();
  const { addNewSector, loading: createLoading, error: createError } = useCreateSector();
  const { editSector, loading: editLoading, error: editError } = useEditSector();
  const { sedes, loading: sedesLoading } = useEnabledSedesFromCache();

  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const title = sector ? (disabled ? 'Ver Sector' : 'Editar Sector') : 'Crear Sector';

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
            <p className="text-xs text-slate-400">Ingresa los detalles requeridos para el sector.</p>
          </div>
        </div>

        <Formik
          initialValues={{
            sector_id: sector?.sector_id || '',
            name: sector?.name || '',
            is_enabled: sector?.is_enabled || true,
            sec_Area: sector?.sec_Area || [],
            SedeId: sector?.SedeId || '',
          }}
          enableReinitialize
          validationSchema={Yup.object({
            name: Yup.string().required(t('sectorForm.validation.required')),
            SedeId: Yup.string().required(t('sectorForm.validation.required')),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            const sectorData: Omit<Sector, 'id'> = { ...values };
            setSubmitting(true);

            if (sector) {
              await editSector({ ...sector, ...sectorData });
            } else {
              await addNewSector(sectorData);
            }

            setSubmitting(false);
            setSuccess(true);
            setMessage(sector ? 'Sector editado con éxito.' : 'Sector creado con éxito.');
            setShowSuccessCard(true);
          }}
        >
          {({ isSubmitting, setFieldValue, values, errors, touched, resetForm }) => (
            <Form>
              <div className="grid grid-cols-1 gap-5">
                {/* Selector de sede */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    {t('sectorForm.form.sede')}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="SedeId"
                      disabled={disabled || sedesLoading}
                      value={values.SedeId}
                      onChange={(e) => setFieldValue('SedeId', e.target.value)}
                      className={`appearance-none pr-10 cursor-pointer ${fieldBase} ${
                        touched.SedeId && errors.SedeId ? 'border border-rose-500' : ''
                      } ${disabled || sedesLoading ? fieldDisabled : ''}`}
                    >
                      <option value="" disabled className="text-slate-800 font-semibold bg-white">
                        {sedesLoading ? 'Cargando sedes...' : 'Selecciona una sede'}
                      </option>
                      {sedes.map((sede) => (
                        <option key={sede.id} value={sede.id} className="text-slate-800 font-semibold bg-white">
                          {sede.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  {touched.SedeId && errors.SedeId && (
                    <div className="text-rose-500 text-xs mt-1 ml-1">{errors.SedeId}</div>
                  )}
                </div>

                {/* Nombre del sector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    {t('sectorForm.form.name')}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    disabled={disabled}
                    value={values.name}
                    onChange={(e) => setFieldValue('name', e.target.value)}
                    placeholder="Ej: Torre A"
                    className={`${fieldBase} ${
                      touched.name && errors.name ? 'border border-rose-500' : ''
                    } ${disabled ? fieldDisabled : ''}`}
                  />
                  {touched.name && errors.name && (
                    <div className="text-rose-500 text-xs mt-1 ml-1">{errors.name}</div>
                  )}
                </div>
              </div>

              {!disabled && (
                <div className="flex justify-center gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    disabled={isSubmitting || (sector ? editLoading : createLoading)}
                    className="flex items-center gap-2 rounded-full px-8 py-3 font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaEraser className="w-4 h-4" />
                    <span>Limpiar</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || (sector ? editLoading : createLoading)}
                    className="flex items-center gap-2 rounded-full px-8 py-3 font-bold text-sm text-white bg-primary-dark hover:opacity-90 shadow-[0_4px_12px_rgba(32,43,52,0.25)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || (sector ? editLoading : createLoading) ? (
                      <MdRefresh className="animate-spin w-5 h-5" />
                    ) : sector ? (
                      <>
                        <FaEdit className="w-4 h-4" />
                        <span>Editar Sector</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        <span>Guardar Sector</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {(createError || editError) && (
                <div className="text-rose-500 text-sm mt-4 text-center">{createError || editError}</div>
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

export default SectorForm;
