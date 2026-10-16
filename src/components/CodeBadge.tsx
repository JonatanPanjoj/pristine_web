import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { useTruncatedCode, TruncatedCodeMode } from '../hooks/useTruncatedCode';

const COPY_FEEDBACK_MS = 1200;

interface CodeBadgeProps {
  value: string;
  mode?: TruncatedCodeMode;
  edgeChars?: number;
  suffixChars?: number;
  copyable?: boolean;
  /** Color del punto izquierdo; por defecto el ámbar de marca. */
  dotColor?: string;
  showDot?: boolean;
  className?: string;
}

/**
 * Píldora para IDs opacos: muestra una versión corta pero mantiene el valor
 * completo accesible por tooltip, lectores de pantalla y portapapeles.
 */
export const CodeBadge: React.FC<CodeBadgeProps> = ({
  value,
  mode = 'edges',
  edgeChars,
  suffixChars,
  copyable = false,
  dotColor,
  showDot = true,
  className = ''
}) => {
  const truncated = useTruncatedCode(value, { mode, edgeChars, suffixChars });

  if (!value) return <span className="text-slate-400">-</span>;

  return (
    <span
      title={value}
      aria-label={value}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-700 ${className}`}
    >
      {showDot && <CodeDot color={dotColor} />}
      <span aria-hidden="true">{truncated}</span>
      <span className="sr-only">{value}</span>
      {copyable && <CopyCodeButton value={value} />}
    </span>
  );
};

interface CodeDotProps {
  color?: string;
}

const CodeDot: React.FC<CodeDotProps> = ({ color }) => (
  <span
    aria-hidden="true"
    className={`w-2 h-2 rounded-full flex-shrink-0 ${color ? '' : 'bg-primary-gold'}`}
    style={color ? { backgroundColor: color } : undefined}
  />
);

interface CopyCodeButtonProps {
  value: string;
}

const CopyCodeButton: React.FC<CopyCodeButtonProps> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(feedbackTimer.current), []);

  const copyFullValue = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      // La píldora suele vivir dentro de filas clickeables: el copiar no navega.
      event.stopPropagation();
      if (!(await writeToClipboard(value))) return;

      setCopied(true);
      clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    },
    [value]
  );

  return (
    <>
      <button
        type="button"
        onClick={copyFullValue}
        aria-label="Copiar código completo"
        className="ml-0.5 text-slate-400 hover:text-primary-gold transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-200 rounded-full"
      >
        {copied ? <FiCheck className="w-3.5 h-3.5 text-success-700" /> : <FiCopy className="w-3.5 h-3.5" />}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Código copiado' : ''}
      </span>
    </>
  );
};

const writeToClipboard = async (value: string): Promise<boolean> => {
  if (!navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};
