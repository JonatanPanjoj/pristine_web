import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import useEnabledSedesForUser from '../../../publicHooks/sedesEnabled/hooks/useEnabledSedesForUser';
import { countSectors } from '../hooks/countSectors';

interface SedeDropdownProps {
  selectedSedeId: string | null;
  setSelectedSedeId: (sedeId: string | null) => void;
}

const SedeDropdown: React.FC<SedeDropdownProps> = ({ selectedSedeId, setSelectedSedeId }) => {
  const { sedes, loading: sedesLoading } = useEnabledSedesForUser();
  const [allSedeOptions, setAllSedeOptions] = useState<{ value: string; label: string }[]>([]);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  useEffect(() => {
    if (sedes.length === 0) return;

    const fetchSedeOptionsWithCount = async () => {
      const optionsWithCounts = await Promise.all(
        sedes.map(async (sede) => {
          const sectorCountResult = await countSectors(sede.id);
          return {
            value: sede.id,
            label: `${sede.name} - Sectores: ${sectorCountResult.sectorCount || 0}`,
          };
        })
      );
      setAllSedeOptions(optionsWithCounts);
    };

    fetchSedeOptionsWithCount();
  }, [sedes]);

  const handleSedeChange = (selectedOption: any) => {
    setSelectedSedeId(selectedOption?.value || null);
  };

  const customStyles = {
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: '150px',
      overflowY: 'auto',
    }),
  };

  return (
    <div>
      <Select
        name="SedeId"
        isDisabled={sedesLoading}
        options={allSedeOptions}
        value={allSedeOptions.find((option) => option.value === selectedSedeId) || null}
        onChange={handleSedeChange}
        isLoading={sedesLoading}
        placeholder="Seleccionar sede"
        menuIsOpen={menuIsOpen}
        onMenuOpen={() => setMenuIsOpen(true)}
        onMenuClose={() => setMenuIsOpen(false)}
        styles={customStyles}
        isClearable
      />
      {selectedSedeId && (
        <p className="text-sm font-bold mt-2">
          Sede seleccionada: {allSedeOptions.find((option) => option.value === selectedSedeId)?.label}
        </p>
      )}
    </div>
  );
};

export default SedeDropdown;