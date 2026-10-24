import { Link } from "react-router-dom";
import { logout } from "../../../../store/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { persistor, RootState } from "../../../../store/store";
import { useState } from "react";

export const Navbar: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.user.user);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar el menú móvil

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen); // Alternar visibilidad del menú móvil
  };

  return (
    <nav className="bg-transparent p-4 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-white/95 p-1 rounded-xl shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
            <img src="/img/logo_only.png" alt="Pristine" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-white text-lg font-bold tracking-tight">
            {process.env.REACT_APP_NAMECOMPANY || 'Pristine'}
          </span>
        </Link>

        {/* Botón de menú para dispositivos móviles */}
        <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {/* Menú de navegación con animación para móvil y estilo plano para PC */}
        <ul
          className={`${
            isOpen
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform -translate-y-10 pointer-events-none"
          } transition-all duration-300 ease-in-out lg:transition-none lg:transform-none lg:opacity-100 lg:pointer-events-auto lg:flex lg:space-x-4 lg:items-center absolute lg:static top-16 left-0 right-0 bg-white text-black lg:bg-transparent lg:text-white p-4 lg:p-0 rounded-lg lg:rounded-none shadow-lg lg:shadow-none z-40`}
        >
          <li>
            <Link
              to="/about"
              className="block lg:inline text-black hover:text-gray-700 lg:text-white lg:hover:text-gray-300 px-4 py-2 lg:px-0 rounded-lg lg:rounded-none"
            >
              Contactar Al Administrador
            </Link>
          </li>
          <li>
            <Link
              to="/services"
              className="block lg:inline text-black hover:text-gray-700 lg:text-white lg:hover:text-gray-300 px-4 py-2 lg:px-0 rounded-lg lg:rounded-none"
            >
              Recuperar Contraseña
            </Link>
          </li>
          <li>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="block lg:inline text-black hover:text-gray-700 lg:text-white lg:hover:text-gray-300 px-4 py-2 lg:px-0 rounded-lg lg:rounded-none"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="block lg:inline text-black hover:text-gray-700 lg:text-white lg:hover:text-gray-300 px-4 py-2 lg:px-0 rounded-lg lg:rounded-none"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};
