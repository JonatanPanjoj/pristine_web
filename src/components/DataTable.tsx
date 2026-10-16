import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS del sistema de diseño
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CELL_TEXT   = 'text-[13px] text-gray-700';
const DEFAULT_CELL_BOLD   = 'text-[13px] font-semibold text-gray-900';
const DEFAULT_BTN         = 'inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors';
const DEFAULT_BTN_GROUP   = 'inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors focus:outline-none';
const DEFAULT_CHECKBOX    = 'w-4 h-4 rounded border-gray-300 accent-orange-500 cursor-pointer focus:ring-2 focus:ring-orange-300';

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface Button {
  label: React.ReactNode;
  key: string;
  visible: boolean;
  columnKey?: string;
  onButtonClick?: (row: any) => void;
  buttonClass?: string;
  render?: () => React.ReactNode;
  disabled?: (row: any) => boolean;
}

interface Column {
  label: React.ReactNode;
  key: string;
  visible: boolean;
  bold?: boolean;
  tdClass?: string;
  cellClass?: string;
  customStyle?: (value: any) => string;
  render?: (value: any) => React.ReactNode;
  type?: 'text' | 'button' | 'checkbox' | 'button_group' | 'color';
  onButtonClick?: (row: any, action?: string) => void;
  onCheckboxChange?: (checked: boolean, row: any) => void;
  buttonClass?: string;
  checkboxClass?: string;
  buttonArray?: Button[];
  chainButtons?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  showRowNumbers?: boolean;
  emptyMessage?: string;
  minRows?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  showRowNumbers,
  emptyMessage = 'No se encontraron registros',
  minRows = 5,
}) => {
  const visibleCount = columns.filter((c) => c.visible).length + (showRowNumbers ? 1 : 0);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">

        {/* ── Cabecera azul ── */}
        <thead>
          <tr
            style={{ backgroundColor: '#2563EB' }}
            className="rounded-xl"
          >
            {showRowNumbers && (
              <th
                className="px-5 py-3.5 text-left text-[11px] font-semibold text-white uppercase tracking-wider whitespace-nowrap w-10 first:rounded-l-xl"
              >
                #
              </th>
            )}
            {columns.map((col, i) => {
              if (!col.visible) return null;
              const isFirst = i === 0 && !showRowNumbers;
              const isLast  = i === columns.filter(c => c.visible).length - 1;
              return (
                <th
                  key={i}
                  className={[
                    'px-5 py-3.5 text-[11px] font-semibold text-white uppercase tracking-wider whitespace-nowrap text-center',
                    isFirst ? 'rounded-l-xl' : '',
                    isLast  ? 'rounded-r-xl' : '',
                  ].join(' ')}
                >
                  {col.label}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* ── Cuerpo ── */}
        <tbody>
          {/* Espaciado post-header */}
          <tr><td colSpan={visibleCount} className="h-2 pointer-events-none" /></tr>

          {/* Estado vacío */}
          {data.length === 0 ? (
            <tr>
              <td colSpan={visibleCount}>
                <div className="flex flex-col items-center justify-center gap-2 min-h-[260px] text-gray-400">
                  <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-[13px] font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            <>
              {data.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {/* Fila con pill redondeada */}
                  <tr className="group">
                    {showRowNumbers && (
                      <td
                        className="px-5 py-0 h-[52px] align-middle text-[12px] text-gray-400 font-medium"
                        style={{ backgroundColor: '#F3F4F6', borderRadius: '12px 0 0 12px' }}
                      >
                        {rowIndex + 1}
                      </td>
                    )}

                    {columns.map((col, colIndex) => {
                      if (!col.visible) return null;

                      const visibleCols = columns.filter(c => c.visible);
                      const isFirst     = colIndex === columns.indexOf(visibleCols[0]) && !showRowNumbers;
                      const isLast      = col === visibleCols[visibleCols.length - 1];

                      const isAction = col.type === 'button' || col.type === 'button_group';
                      const isCenter = col.type === 'checkbox' || col.type === 'color' || isAction;

                      return (
                        <td
                          key={colIndex}
                          className={[
                            'px-5 py-0 h-[52px] align-middle',
                            isCenter ? 'text-center' : 'text-center',
                            col.tdClass ?? '',
                          ].join(' ')}
                          style={{
                            backgroundColor: '#F3F4F6',
                            borderRadius: isFirst
                              ? '12px 0 0 12px'
                              : isLast
                              ? '0 12px 12px 0'
                              : '0',
                          }}
                        >
                          {/* ── TEXT ── */}
                          {col.type === 'text' && (
                            <span
                              className={[
                                col.cellClass ?? (col.bold ? DEFAULT_CELL_BOLD : DEFAULT_CELL_TEXT),
                                col.customStyle ? col.customStyle(row[col.key]) : '',
                              ].join(' ')}
                            >
                              {col.render
                                ? col.render(row[col.key])
                                : (row[col.key] ?? '—')}
                            </span>
                          )}

                          {/* ── COLOR SWATCH ── */}
                          {col.type === 'color' && (
                            <div
                              className="w-6 h-6 rounded-lg mx-auto border border-gray-200"
                              style={{ backgroundColor: row[col.key] || '#FFFFFF' }}
                              title={row[col.key]}
                            />
                          )}

                          {/* ── BUTTON ── */}
                          {col.type === 'button' && (
                            <button
                              onClick={() => col.onButtonClick?.(row)}
                              className={col.buttonClass || DEFAULT_BTN}
                            >
                              {col.render ? col.render(row[col.key]) : 'Acción'}
                            </button>
                          )}

                          {/* ── CHECKBOX ── */}
                          {col.type === 'checkbox' && (
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                className={col.checkboxClass || DEFAULT_CHECKBOX}
                                checked={row[col.key] || false}
                                onChange={(e) =>
                                  col.onCheckboxChange?.(e.target.checked, row)
                                }
                              />
                            </div>
                          )}

                          {/* ── BUTTON GROUP ── */}
                          {col.type === 'button_group' && col.buttonArray && (
                            <div className="flex items-center justify-center gap-1.5">
                              {col.chainButtons
                                ? (() => {
                                    const btn = col.buttonArray!.find(
                                      (b) => b.visible && (!b.columnKey || row[b.columnKey] !== null)
                                    );
                                    if (!btn) return null;
                                    return (
                                      <button
                                        key={btn.key}
                                        onClick={() => btn.onButtonClick?.(row)}
                                        className={btn.buttonClass || DEFAULT_BTN_GROUP}
                                      >
                                        {btn.label}
                                      </button>
                                    );
                                  })()
                                : col.buttonArray.map((btn) => {
                                    if (!btn.visible) return null;
                                    if (btn.columnKey && row[btn.columnKey] === null) return null;
                                    const isDisabled = btn.disabled ? btn.disabled(row) : false;
                                    return (
                                      <button
                                        key={btn.key}
                                        disabled={isDisabled}
                                        onClick={() => !isDisabled && btn.onButtonClick?.(row)}
                                        className={[
                                          btn.buttonClass || DEFAULT_BTN_GROUP,
                                          isDisabled ? 'opacity-30 cursor-not-allowed grayscale' : '',
                                        ].join(' ')}
                                      >
                                        {btn.label}
                                      </button>
                                    );
                                  })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Separador entre filas */}
                  <tr><td colSpan={visibleCount} className="h-2 pointer-events-none" /></tr>
                </React.Fragment>
              ))}

              {/* Relleno mínimo */}
              {data.length > 0 && data.length < minRows && (
                <tr>
                  <td
                    colSpan={visibleCount}
                    style={{ height: `${(minRows - data.length) * 54}px` }}
                    className="pointer-events-none"
                  />
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;