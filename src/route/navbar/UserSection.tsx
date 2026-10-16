import React, { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

interface UserSectionProps {
  user: any;
  handleLogout: () => void;
  isMinimized: boolean;
  // FIX: Se recibe isMobile como prop desde SlideBar en lugar de duplicar
  // la detección de resize dentro de este componente.
  isMobile: boolean;
}

const UserSection: React.FC<UserSectionProps> = ({ user, handleLogout, isMinimized, isMobile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div
      className={`relative bottom-4 left-0 p-2 text-gray-800 transition-all duration-500 ease-in-out ${
        isMinimized ? 'w-20 text-center' : 'w-full flex items-center'
      }`}
    >
      {user ? (
        <>
          {/* Avatar del perfil */}
          {user.url_photo ? (
            <img
              src={user.url_photo}
              alt={user.name || 'Usuario'}
              className={`rounded-full object-cover ${isMinimized ? 'mx-auto w-8 h-8' : 'mr-3 w-10 h-10'}`}
            />
          ) : (
            user.name && (
              <div
                className={`flex items-center justify-center rounded-full ${
                  isMinimized ? 'mx-auto w-8 h-8' : 'mr-3 w-10 h-10'
                } bg-orange-500`}
              >
                <span className="text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )
          )}

          {/* Información del usuario si no está minimizado */}
          {!isMinimized && (
            <div className="flex flex-col flex-grow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#333333' }}>
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.rol_name}</p>
                </div>
                <div className="ml-2">
                  <button onClick={toggleMenu} className="focus:outline-none">
                    {isMenuOpen ? (
                      <HiChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <HiChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submenú desplegable con animación */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden transform ${
                  isMenuOpen ? 'max-h-32 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
                }`}
                style={{ transitionProperty: 'max-height, opacity, transform' }}
              >
                {isMenuOpen && (
                  <div className="mt-2 bg-white rounded-lg shadow-lg py-2 z-50">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => {
                        // TODO: navegar a la ruta de perfil del usuario
                        setIsMenuOpen(false);
                      }}
                    >
                      Ver perfil
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FIX: En móvil minimizado mostramos el toggle, usando el isMobile recibido por prop */}
          {isMobile && isMinimized && (
            <button onClick={toggleMenu} className="focus:outline-none mt-2">
              {isMenuOpen ? (
                <HiChevronUp className="w-5 h-5 text-gray-500 mx-auto" />
              ) : (
                <HiChevronDown className="w-5 h-5 text-gray-500 mx-auto" />
              )}
            </button>
          )}
        </>
      ) : (
        <p className="text-center text-sm" style={{ color: '#333333' }}>
          No hay usuario
        </p>
      )}
    </div>
  );
};

export default UserSection;
