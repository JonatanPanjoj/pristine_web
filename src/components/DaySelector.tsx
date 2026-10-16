import React, { useState } from 'react';
import { useField } from 'formik';

interface DaySelectorProps {
  label: string;
  name: string;
  days?: { [key: string]: boolean }; // Objeto opcional para establecer los días por defecto
  disabled?: boolean; // Propiedad para deshabilitar el selector
}

const DaySelector: React.FC<DaySelectorProps> = ({
  label,
  name,
  days = { lunes: false, martes: false, miércoles: false, jueves: false, viernes: false }, // Días por defecto
  disabled = false,
}) => {
  const [field, meta] = useField(name);
  const [localDays, setLocalDays] = useState(days); // Estado local para almacenar el estado de los días

  // Función para manejar el cambio de estado de los días
  const toggleDay = (day: string) => {
    if (disabled) return; // No permite cambiar el estado si está deshabilitado

    const updatedDays = { ...localDays, [day]: !localDays[day] }; // Cambia el valor de ese día
    setLocalDays(updatedDays); // Actualiza el estado local

    // Si estamos usando Formik, sincronizamos el estado con el formulario
    field.onChange({ target: { name, value: updatedDays } });
  };

  return (
    <div className="flex flex-col mb-4">
      {/* Label con tamaño de texto responsivo */}
      <label
        htmlFor={name}
        className={`mb-2 text-black font-light text-xs md:text-sm`}
      >
        {label}:
      </label>

      {/* Contenedor de los botones para cada día */}
      <div className="flex gap-2">
        {Object.keys(localDays).map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day)}
            disabled={disabled} // Deshabilita el botón si el selector está deshabilitado
            className={`py-2 px-4 rounded-md text-sm md:text-base 
              ${localDays[day] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} 
              ${disabled ? 'cursor-not-allowed bg-gray-300' : 'cursor-pointer'}`}
          >
            {day.charAt(0).toUpperCase() + day.slice(1)} {/* Capitaliza el primer carácter */}
          </button>
        ))}
      </div>

      {/* Mensaje de error */}
      {meta.touched && meta.error ? (
        <div className="text-red-500 text-xs md:text-sm mt-1">{meta.error}</div>
      ) : null}
    </div>
  );
};

export default DaySelector;
