import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  hasAvatar?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  cols = 5,
  hasAvatar = true,
}) => {
  const dummyRows = Array.from({ length: rows });
  const dummyCols = Array.from({ length: cols - (hasAvatar ? 1 : 0) });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse animate-pulse">
        <thead>
          <tr className="border-b border-gray-100">
            {hasAvatar && (
              <th className="px-5 py-3 w-12">
                <div className="h-4 bg-neutral-200 rounded w-8" />
              </th>
            )}
            {dummyCols.map((_, i) => (
              <th key={i} className="px-5 py-3 text-left">
                <div className="h-4 bg-neutral-200 rounded w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {dummyRows.map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-50">
              {hasAvatar && (
                <td className="px-5 py-4 align-middle">
                  <div className="w-9 h-9 rounded-full bg-neutral-200" />
                </td>
              )}
              {dummyCols.map((_, colIndex) => (
                <td key={colIndex} className="px-5 py-4 align-middle">
                  <div
                    className={`h-4 bg-neutral-200 rounded ${
                      colIndex === 0 ? 'w-36' : colIndex === 1 ? 'w-24' : 'w-16'
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonTable;
