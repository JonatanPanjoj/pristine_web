// utils/areaCode.ts
// El código de un área siempre se representa con 4 dígitos (2 → "0002"): es lo
// que se codifica en el QR y lo que se imprime en la etiqueta, así que debe ser
// idéntico en la tabla, la vista previa y el PDF.

export const AREA_CODE_LENGTH = 4;

export const formatAreaCode = (areaId?: number | string | null): string =>
  (areaId ?? 0).toString().padStart(AREA_CODE_LENGTH, '0');
