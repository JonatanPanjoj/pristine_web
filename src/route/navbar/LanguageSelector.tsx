import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineQuestionMarkCircle, HiChevronRight, HiChevronDown } from 'react-icons/hi';
import { ChangeLanguageUseCase } from '../../i18n/application/ChangeLanguageUseCase';

interface LanguageSelectorProps {
  isMinimized: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isMinimized }) => {
  const { t } = useTranslation();
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  // FIX: Referencia al contenedor para posicionar el submenú correctamente
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: string) => {
    ChangeLanguageUseCase.execute(lang);
    setIsSubMenuOpen(false);
  };

  const toggleSubMenu = () => {
    setIsSubMenuOpen((prev) => !prev);
  };

  // FIX: Cierra el submenú si el usuario hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSubMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMinimized) return null;

  return (
    // FIX: Se añade position: relative al contenedor para anclar el submenú correctamente
    <div className="relative" ref={containerRef}>
      <div
        className="flex items-center py-2 px-3 hover:bg-gray-100 cursor-pointer text-[#9197B3] rounded"
        onClick={toggleSubMenu}
      >
        <HiOutlineQuestionMarkCircle className="w-6 h-6 mr-3" />
        <span className="text-sm font-light">Seleccionar Idioma</span>
        {isSubMenuOpen ? (
          <HiChevronDown className="ml-auto w-5 h-5" />
        ) : (
          <HiChevronRight className="ml-auto w-5 h-5" />
        )}
      </div>

      {/* FIX: bottom-full abre el submenú hacia arriba para no salirse del sidebar */}
      {isSubMenuOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-full bg-white rounded-lg shadow-lg py-2 z-50">
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => handleLanguageChange('en')}
          >
            English
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => handleLanguageChange('es')}
          >
            Español
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
