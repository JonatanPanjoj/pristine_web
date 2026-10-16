// src/pages/areaCRUD/components/AreaForm.tsx
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { FaSave, FaEdit, FaEraser } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { FiChevronDown, FiLayers } from 'react-icons/fi';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Area } from '../../../models/Area';
import useCreateArea from '../hooks/useCreateArea';
import { useEditArea } from '../hooks/useEditArea';
import { ExitoCard } from '../../../components/ExitoCard';
import useEnabledSedesFromCache from '../../../components/sedesEnabled/hooks/useEnabledSedesFromCache';
import { useSectorsBySedeId } from '../hooks/useSectorsBySedeId';

interface AreaFormProps {
  area?: Area;
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

const AreaForm: React.FC<AreaFormProps> = ({ area, disabled = false, onSuccess }) => {
  const { t } = useTranslation();
  const { addNewArea, loading: createLoading, error: createError } = useCreateArea();
  const { editArea, loading: editLoading, error: editError } = useEditArea();
  const { sedes, loading: sedesLoading } = useEnabledSedesFromCache();

  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(area?.SedeId || area?.sede_id || null);

  const { sectors, loading: sectorsLoading } = useSectorsBySedeId(selectedSedeId || '');

  const title = area ? (disabled ? 'Ver Área' : 'Editar Área') : 'Crear Área';

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
            <FiLayers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="text-xs text-slate-400">Ingresa los detalles requeridos para la ubicación.</p>
          </div>
        </div>

        <Formik
          initialValues={{
            area_id: area?.area_id || '',
            name: area?.name || '',
            is_enabled: area?.is_enabled ?? area?.status ?? true,
            level: area?.level || '',
            SectorId: area?.SectorId || area?.sector_id || '',
            SedeId: area?.SedeId || area?.sede_id || '',
          }}
          enableReinitialize
          validationSchema={Yup.object({
            name: Yup.string().required(t('areaForm.validation.required')),
            level: Yup.string().required('El piso o nivel es requerido'),
            SectorId: Yup.string().required(t('areaForm.validation.required')),
            SedeId: Yup.string().required(t('areaForm.validation.required')),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            const areaData: Omit<Area, 'id'> = { ...values };
            setSubmitting(true);

            if (area) {
              const res = await editArea({ ...area, ...areaData });
              if (res && !res.success) {
                setSubmitting(false);
                return;
              }
            } else {
              const res = await addNewArea(areaData);
              if (res && !res.success) {
                setSubmitting(false);
                return;
              }
            }

            setSubmitting(false);
            setSuccess(true);
            setMessage(area ? 'Área editada con éxito.' : 'Área creada con éxito.');
            setShowSuccessCard(true);
          }}
        >
          {({ isSubmitting, setFieldValue, values, errors, touched, resetForm }) => (
            <Form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Selector de sede */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    {t('areaForm.form.sede')}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="SedeId"
                      disabled={disabled || sedesLoading}
                      value={values.SedeId}
                      onChange={(e) => {
                        const sedeId = e.target.value;
                        setFieldValue('SedeId', sedeId);
                        setSelectedSedeId(sedeId);
                        setFieldValue('SectorId', '');
                      }}
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

                {/* Selector de sector dependiente de SedeId */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    {t('areaForm.form.sector')}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="SectorId"
                      disabled={disabled || sectorsLoading || !selectedSedeId}
                      value={values.SectorId}
                      onChange={(e) => setFieldValue('SectorId', e.target.value)}
                      className={`appearance-none pr-10 cursor-pointer ${fieldBase} ${
                        touched.SectorId && errors.SectorId ? 'border border-rose-500' : ''
                      } ${disabled || sectorsLoading || !selectedSedeId ? fieldDisabled : ''}`}
                    >
                      <option value="" disabled className="text-slate-800 font-semibold bg-white">
                        {sectorsLoading ? 'Cargando sectores...' : 'Selecciona un sector'}
                      </option>
                      {sectors.map((sector) => (
                        <option key={sector.id} value={sector.id} className="text-slate-800 font-semibold bg-white">
                          {sector.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  {touched.SectorId && errors.SectorId && (
                    <div className="text-rose-500 text-xs mt-1 ml-1">{errors.SectorId}</div>
                  )}
                </div>

                {/* Nombre del área */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    {t('areaForm.form.name')}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    disabled={disabled}
                    value={values.name}
                    onChange={(e) => setFieldValue('name', e.target.value)}
                    placeholder="Ej: Recepcion"
                    className={`${fieldBase} ${
                      touched.name && errors.name ? 'border border-rose-500' : ''
                    } ${disabled ? fieldDisabled : ''}`}
                  />
                  {touched.name && errors.name && (
                    <div className="text-rose-500 text-xs mt-1 ml-1">{errors.name}</div>
                  )}
                </div>

                {/* Nivel / piso */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    Nivel/piso
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="level"
                    disabled={disabled}
                    value={values.level}
                    onChange={(e) => setFieldValue('level', e.target.value)}
                    placeholder="Ej: Nivel 1, Piso 2, B"
                    className={`${fieldBase} ${
                      touched.level && errors.level ? 'border border-rose-500' : ''
                    } ${disabled ? fieldDisabled : ''}`}
                  />
                  {touched.level && errors.level && (
                    <div className="text-rose-500 text-xs mt-1 ml-1">{errors.level}</div>
                  )}
                </div>
              </div>

              {!disabled && (
                <div className="flex justify-center gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    disabled={isSubmitting || (area ? editLoading : createLoading)}
                    className="flex items-center gap-2 rounded-full px-8 py-3 font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaEraser className="w-4 h-4" />
                    <span>Limpiar</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || (area ? editLoading : createLoading)}
                    className="flex items-center gap-2 rounded-full px-8 py-3 font-bold text-sm text-white bg-primary-dark hover:opacity-90 shadow-[0_4px_12px_rgba(32,43,52,0.25)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || (area ? editLoading : createLoading) ? (
                      <MdRefresh className="animate-spin w-5 h-5" />
                    ) : area ? (
                      <>
                        <FaEdit className="w-4 h-4" />
                        <span>Editar área</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        <span>Guardar área</span>
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

export default AreaForm;
