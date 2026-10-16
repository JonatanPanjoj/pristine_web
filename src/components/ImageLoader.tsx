// src/components/ImageLoader.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageLoaderProps {
  src: string;
  alt: string;
  onLoad?: () => void;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ src, alt, onLoad }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    console.error(`Error loading image: ${src}`);
  };

  return (
    <div>
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <img src="/img/img-loader.gif" alt="loading" className="h-16 w-16" />
          <h2 className="text-xl ml-4">{t('loading')}</h2>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block', width: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default ImageLoader;
