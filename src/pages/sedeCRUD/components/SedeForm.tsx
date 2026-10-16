import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { FaGlobe, FaMapMarkerAlt, FaSave, FaEdit } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Timestamp } from 'firebase/firestore';

// Componentes y Hooks
import FormInput from '../../../components/FormInput';
import { Sede } from '../../../models/Sede';
import useCreateSede from '../hooks/useCreateSede';
import { useEditSede } from '../hooks/useEditSede';
import { useGeoData } from '../hooks/useGeoData'; // El hook que creamos
import { ExitoCard } from '../../../components/ExitoCard';
import Modal from '../../../components/Modal';
import MapComponent from '../components/map';

interface SedeFormProps {
  sede?: Sede;
  disabled?: boolean;
}

const SedeForm: React.FC<SedeFormProps> = ({ sede, disabled = false }) => {
  const { t } = useTranslation();
  const { addNewSede, loading: createLoading, error: createError } = useCreateSede();
  const { editSede, loading: editLoading, error: editError } = useEditSede();
  const { departments, municipalities, loading: geoLoading } = useGeoData();

  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);

  // Estados para el mapa
  const [mapLat] = useState<number>(sede?.latitude ? parseFloat(sede.latitude) : 14.62212239740069);
  const [mapLng] = useState<number>(sede?.length ? parseFloat(sede.length) : -90.51117979773362);
  const [mapMode, setMapMode] = useState<'latlng' | 'full'>('latlng');

  const handleSaveLocation = (
    lat: number,
    lng: number,
    zone: string,
    municipality: string,
    department: string,
    address: string,
    setFieldValue: any
  ) => {
    setFieldValue('latitude', lat.toString());
    setFieldValue('length', lng.toString());

    if (mapMode === 'full') {
      // Intentamos hacer match con los nombres de nuestra base de datos local
      // Limpiamos strings por si la API devuelve "Guatemala Department"
      const cleanDept = department.replace(/Department|Departamento/gi, '').trim();
      
      setFieldValue('department', cleanDept);
      setFieldValue('municipality', municipality);
      setFieldValue('zone', zone);
      setFieldValue('address', address);
    }
    setShowMapModal(false);
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-white py-4 shadow-sm border-b mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {sede ? (disabled ? 'Ver Sede' : 'Editar Sede') : 'Crear Sede'}
        </h1>
      </div>

      <Formik
        initialValues={{
          sede_id: sede?.sede_id || '',
          name: sede?.name || '',
          department: sede?.department || '',
          municipality: sede?.municipality || '',
          address: sede?.address || '',
          zone: sede?.zone || '',
          latitude: sede?.latitude || mapLat.toString(),
          length: sede?.length || mapLng.toString(),
          sector: sede?.sector || [],
          url_photo: sede?.url_photo || null,
          is_enabled: sede?.is_enabled ?? true,
        }}
        enableReinitialize
        validationSchema={Yup.object({
          name: Yup.string().required(t('sedeForm.validation.required')),
          department: Yup.string().required(t('sedeForm.validation.required')),
          municipality: Yup.string().required(t('sedeForm.validation.required')),
          address: Yup.string().required(t('sedeForm.validation.required')),
          zone: Yup.string().required(t('sedeForm.validation.required')),
          latitude: Yup.string().required(t('sedeForm.validation.required')),
          length: Yup.string().required(t('sedeForm.validation.required')),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          const sedeData: Omit<Sede, 'id'> = {
            ...values,
            updatedAt: Timestamp.now(),
          };

          setSubmitting(true);
          if (sede) {
            await editSede({ ...sede, ...sedeData });
          } else {
            await addNewSede(sedeData);
          }
          setSubmitting(false);
          setSuccess(true);
          setMessage(sede ? 'Sede editada con éxito.' : 'Sede creada con éxito.');
          setShowSuccessCard(true);

          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nombre de la Sede */}
              <FormInput label={t('sedeForm.form.name')} name="name" textColor="text-black" disabled={disabled} />

              {/* Selector de Departamento */}
              <div className="flex flex-col">
                <label className="text-black text-sm font-medium mb-1">{t('sedeForm.form.department')}</label>
                <select
                  name="department"
                  value={values.department}
                  disabled={disabled || geoLoading}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black focus:ring-orange-500 focus:border-orange-500"
                  onChange={(e) => {
                    setFieldValue('department', e.target.value);
                    setFieldValue('municipality', ''); // Reset municipio
                  }}
                >
                  <option value="">Seleccione Departamento</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Municipio */}
              <div className="flex flex-col">
                <label className="text-black text-sm font-medium mb-1">{t('sedeForm.form.municipality')}</label>
                <select
                  name="municipality"
                  value={values.municipality}
                  disabled={disabled || !values.department}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black focus:ring-orange-500 focus:border-orange-500"
                  onChange={(e) => setFieldValue('municipality', e.target.value)}
                >
                  <option value="">Seleccione Municipio</option>
                  {values.department && municipalities[values.department]?.map((muni) => (
                    <option key={muni} value={muni}>{muni}</option>
                  ))}
                </select>
              </div>

              <FormInput label={t('sedeForm.form.zone')} name="zone" textColor="text-black" disabled={disabled} />
              <div className="md:col-span-2">
                <FormInput label={t('sedeForm.form.address')} name="address" textColor="text-black" disabled={disabled} />
              </div>

              {/* Modo de Mapa */}
              <div className="col-span-2 flex items-center space-x-6 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                <span className="text-sm font-bold text-gray-700">Modo de Captura:</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-orange-500"
                    name="mapMode"
                    checked={mapMode === 'latlng'}
                    onChange={() => setMapMode('latlng')}
                  />
                  <span className="ml-2 text-sm">{t('sedeForm.button.latLngOnly')}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-orange-500"
                    name="mapMode"
                    checked={mapMode === 'full'}
                    onChange={() => setMapMode('full')}
                  />
                  <span className="ml-2 text-sm">{t('sedeForm.button.fullLocation')}</span>
                </label>
              </div>

              {/* Botón Abrir Mapa */}
              {!disabled && (
                <div className="col-span-2 flex justify-center py-2">
                  <button
                    className="flex items-center bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
                    onClick={() => setShowMapModal(true)}
                    type="button"
                  >
                    <FaMapMarkerAlt className="mr-2 w-5 h-5" />
                    {t('sedeForm.button.openMap')}
                    <FaGlobe className="ml-2 w-5 h-5" />
                  </button>
                </div>
              )}

              <FormInput label={t('sedeForm.form.latitude')} name="latitude" textColor="text-black" disabled={disabled} />
              <FormInput label={t('sedeForm.form.length')} name="length" textColor="text-black" disabled={disabled} />
            </div>

            {/* Botón Guardar / Editar */}
            {!disabled && (
              <div className="flex justify-end pt-10">
                <button
                  type="submit"
                  className={`bg-orange-500 hover:bg-orange-600 text-white py-3 px-10 rounded-xl flex items-center space-x-3 text-sm font-bold shadow-md transition-all ${isSubmitting || (sede ? editLoading : createLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting || (sede ? editLoading : createLoading)}
                >
                  {isSubmitting || (sede ? editLoading : createLoading) ? (
                    <MdRefresh className="animate-spin h-6 w-6" />
                  ) : sede ? (
                    <>
                      <FaEdit className="h-5 w-5" />
                      <span>Editar Sede</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="h-5 w-5" />
                      <span>Guardar Sede</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {(createError || editError) && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="text-red-700 text-sm font-bold">{createError || editError}</p>
              </div>
            )}
            
            {/* Modal del Mapa */}
            {showMapModal && (
              <Modal isOpen={showMapModal} onClose={() => setShowMapModal(false)}>
                <MapComponent
                  initialLat={mapLat}
                  initialLng={mapLng}
                  mode="edit"
                  onSave={(lat, lng, zone, muni, dept, addr) =>
                    handleSaveLocation(lat, lng, zone, muni, dept, addr, setFieldValue)
                  }
                  onExit={() => setShowMapModal(false)}
                />
              </Modal>
            )}
          </Form>
        )}
      </Formik>

      {/* Card de Éxito */}
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

export default SedeForm;