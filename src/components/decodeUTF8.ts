// Función para decodificar texto mal interpretado como Latin-1 a UTF-8 correctamente
const decodeUTF8 = (str: string): string => {
  if (!str) return "";
  try {
    const encodedBytes = new Uint8Array(str.split('').map(char => char.charCodeAt(0)));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(encodedBytes);
    return decoded.includes('\uFFFD') ? str : decoded;
  } catch (_) {
    return str;
  }
};

export default decodeUTF8;