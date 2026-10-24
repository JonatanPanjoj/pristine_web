import React from 'react';
import logoYLetras from '../../../assets/img/logo_y_letras.png';

interface PristineLogoProps {
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
}

export const PristineLogo: React.FC<PristineLogoProps> = ({
  className = '',
  style = {},
  width = 'auto',
  height = 'auto',
}) => {
  return (
    <img
      src={logoYLetras}
      alt="Pristine"
      className={`object-contain mx-auto ${className}`}
      style={{
        width,
        height,
        maxHeight: style.maxHeight ?? 64,
        maxWidth: style.maxWidth ?? '100%',
        ...style,
      }}
    />
  );
};

export default PristineLogo;
