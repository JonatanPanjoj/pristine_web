import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Reutiliza exactamente la misma API de columnas que DataTable.
// Tipos: 'text' | 'button' | 'checkbox' | 'button_group' | 'color' | 'badge'
// Uso: mismo array de columns + data que le pasarías a DataTable.
// ─────────────────────────────────────────────────────────────────────────────

// ── Design-system defaults (igual que DataTable) ──────────────────────────────

const DEFAULT_BTN =
  'inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors';
const DEFAULT_BTN_GROUP =
  'inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors focus:outline-none border border-gray-200';
const DEFAULT_CHECKBOX =
  'w-4 h-4 rounded border-gray-300 accent-orange-500 cursor-pointer focus:ring-2 focus:ring-orange-300';

// ── Interfaces (idénticas a DataTable) ───────────────────────────────────────

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

export interface CardColumn {
  label: React.ReactNode;
  key: string;
  visible: boolean;
  bold?: boolean;
  cellClass?: string;
  customStyle?: (value: any) => string;
  render?: (value: any) => React.ReactNode;
  /** Igual que DataTable: 'text' | 'button' | 'checkbox' | 'button_group' | 'color' | 'badge' */
  type?: 'text' | 'button' | 'checkbox' | 'button_group' | 'color' | 'badge';
  onButtonClick?: (row: any, action?: string) => void;
  onCheckboxChange?: (checked: boolean, row: any) => void;
  buttonClass?: string;
  checkboxClass?: string;
  buttonArray?: Button[];
  chainButtons?: boolean;
  /** Solo para 'badge': función que devuelve { label, bg, text } según el valor */
  badgeStyle?: (value: any) => { label?: string; bg: string; text: string; dot?: string };
  /** Columna "título principal" de la card (solo la primera marcada se usa) */
  isTitle?: boolean;
  /** Columna "subtítulo / código" debajo del título */
  isSubtitle?: boolean;
  /** Si true, esta columna se muestra en el header de la card (junto al badge de status) */
  isHeader?: boolean;
  /** Si true, se renderiza en el footer de la card */
  isFooter?: boolean;
}

interface DataCardGridProps {
  columns: CardColumn[];
  data: any[];
  /** Columnas por fila: 1 | 2 | 3 | 4. Por defecto 3 */
  cols?: 1 | 2 | 3 | 4;
  emptyMessage?: string;
  loading?: boolean;
  /** Clave única de cada fila (por defecto 'id') */
  rowKey?: string;
}

// ── Grid cols map ─────────────────────────────────────────────────────────────

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

// ── Cell renderer (mismo switch que DataTable) ────────────────────────────────

const CellRenderer: React.FC<{ col: CardColumn; row: any }> = ({ col, row }) => {
  const value = row[col.key];

  switch (col.type) {

    case 'badge': {
      const style = col.badgeStyle?.(value) ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
      const labelText = style.label ?? (col.render ? null : String(value ?? '—'));
      return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
          {style.dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />}
          {col.render ? col.render(value) : labelText}
        </span>
      );
    }

    case 'color':
      return (
        <div
          className="w-5 h-5 rounded-md border border-gray-200 inline-block"
          style={{ backgroundColor: value || '#FFFFFF' }}
          title={value}
        />
      );

    case 'button':
      return (
        <button
          onClick={() => col.onButtonClick?.(row)}
          className={col.buttonClass || DEFAULT_BTN}
        >
          {col.render ? col.render(value) : 'Acción'}
        </button>
      );

    case 'checkbox':
      return (
        <input
          type="checkbox"
          className={col.checkboxClass || DEFAULT_CHECKBOX}
          checked={value || false}
          onChange={(e) => col.onCheckboxChange?.(e.target.checked, row)}
        />
      );

    case 'button_group':
      if (!col.buttonArray) return null;
      if (col.chainButtons) {
        const btn = col.buttonArray.find(
          (b) => b.visible && (!b.columnKey || row[b.columnKey] !== null)
        );
        if (!btn) return null;
        return (
          <button onClick={() => btn.onButtonClick?.(row)} className={btn.buttonClass || DEFAULT_BTN_GROUP}>
            {btn.label}
          </button>
        );
      }
      return (
        <div className="flex items-center gap-1 flex-wrap">
          {col.buttonArray.map((btn) => {
            if (!btn.visible) return null;
            if (btn.columnKey && row[btn.columnKey] === null) return null;
            const isDisabled = btn.disabled?.(row) ?? false;
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
      );

    default: // 'text'
      return (
        <span
          className={[
            col.cellClass ?? (col.bold ? 'text-[13px] font-semibold text-gray-900' : 'text-[13px] text-gray-700'),
            col.customStyle ? col.customStyle(value) : '',
          ].join(' ')}
        >
          {col.render ? col.render(value) : (value ?? '—')}
        </span>
      );
  }
};

// ── Card ──────────────────────────────────────────────────────────────────────

const DataCard: React.FC<{ columns: CardColumn[]; row: any }> = ({ columns, row }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const visible     = columns.filter(c => c.visible);
  const headerCols  = visible.filter(c => c.isHeader);
  const titleCol    = visible.find(c => c.isTitle);
  const subtitleCol = visible.find(c => c.isSubtitle);
  const footerCols  = visible.filter(c => c.isFooter);
  // Columnas del cuerpo: todo lo que no es header/title/subtitle/footer
  const bodyCols    = visible.filter(c => !c.isHeader && !c.isTitle && !c.isSubtitle && !c.isFooter);

  // Separar button_group del cuerpo para el footer de acciones
  const actionCol   = bodyCols.find(c => c.type === 'button_group' || c.type === 'button');
  const infoCols    = bodyCols.filter(c => c.type !== 'button_group' && c.type !== 'button');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">

      {/* ── Header: badges + kebab de button_group (si viene en headerCols) ── */}
      {(headerCols.length > 0 || actionCol) && (
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {headerCols.map((col, i) => (
              <CellRenderer key={i} col={col} row={row} />
            ))}
          </div>

          {/* Kebab: solo si hay button_group y no está marcado como footer */}
          {actionCol && !actionCol.isFooter && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5"  r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-7 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[140px]">
                    {actionCol.buttonArray?.map(btn => {
                      if (!btn.visible) return null;
                      if (btn.columnKey && row[btn.columnKey] === null) return null;
                      const isDisabled = btn.disabled?.(row) ?? false;
                      return (
                        <button
                          key={btn.key}
                          disabled={isDisabled}
                          onClick={() => { setMenuOpen(false); !isDisabled && btn.onButtonClick?.(row); }}
                          className={`w-full text-left text-xs px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Title ── */}
      {titleCol && (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-sm">
            {String(row[titleCol.key] ?? '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">
              {titleCol.render ? titleCol.render(row[titleCol.key]) : row[titleCol.key]}
            </span>
            {subtitleCol && (
              <span className="text-[11px] text-gray-400 mt-0.5">
                {subtitleCol.render ? subtitleCol.render(row[subtitleCol.key]) : row[subtitleCol.key]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Body: info cols ── */}
      {infoCols.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {infoCols.map((col, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium shrink-0 mr-2">{col.label}:</span>
              <CellRenderer col={col} row={row} />
            </div>
          ))}
        </div>
      )}

      {/* ── Footer: action buttons (si actionCol está marcado como footer) ── */}
      {actionCol && actionCol.isFooter && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-50">
          <CellRenderer col={actionCol} row={row} />
        </div>
      )}

    </div>
  );
};

// ── DataCardGrid ──────────────────────────────────────────────────────────────

const DataCardGrid: React.FC<DataCardGridProps> = ({
  columns,
  data,
  cols = 3,
  emptyMessage = 'No se encontraron registros',
  loading = false,
  rowKey = 'id',
}) => {
  if (loading) {
    return (
      <div className={`grid ${GRID_COLS[cols]} gap-4`}>
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 animate-pulse">
            <div className="h-5 w-24 bg-gray-100 rounded-full" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
        <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${GRID_COLS[cols]} gap-4`}>
      {data.map((row, i) => (
        <DataCard
          key={row[rowKey] ?? i}
          columns={columns}
          row={row}
        />
      ))}
    </div>
  );
};

export default DataCardGrid;
