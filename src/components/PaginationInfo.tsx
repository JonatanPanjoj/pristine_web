import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalDocs: number;
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({ currentPage, pageSize, totalDocs }) => {
  const { t } = useTranslation();

  return (
    <div className="text-base text-gray-600 mb-4 opacity-90">
      {t('pagination.displayingDocuments', {
        start: (currentPage - 1) * pageSize + 1,
        end: Math.min(currentPage * pageSize, totalDocs),
        total: totalDocs,
      })}
    </div>
  );
};

export default PaginationInfo;
