import React from 'react';

interface HamburgerButtonProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ isOpen, toggleMenu }) => {
  return (
    <button onClick={toggleMenu} className="p-4 text-gray-700 bg-gray-200 rounded-lg fixed top-4 right-4 md:hidden z-50">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'} />
      </svg>
    </button>
  );
};

export default HamburgerButton;
