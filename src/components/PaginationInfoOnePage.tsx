import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationInfoProps {

  totalDocs: number;
}

const PaginationInfoOnePage: React.FC<PaginationInfoProps> = ({ totalDocs }) => {
  const { t } = useTranslation();

  return (
    <div className="text-base text-gray-600 mb-4 opacity-90">
      {t('pagination.displayingDocumentsOnePage', {
        total: totalDocs,
      })}
    </div>
  );
};

export default PaginationInfoOnePage;
