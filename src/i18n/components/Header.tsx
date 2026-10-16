// presentation/components/Header.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChangeLanguageUseCase } from '../application/ChangeLanguageUseCase';

const Header: React.FC = () => {
  const { t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    ChangeLanguageUseCase.execute(lang);
  };

  return (
    <header>
      <h1>{t('welcome_message')}</h1>
      <button onClick={() => handleLanguageChange('en')}>English</button>
      <button onClick={() => handleLanguageChange('es')}>Español</button>
    </header>
  );
};

export default Header;
