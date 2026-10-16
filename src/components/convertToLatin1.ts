// Función para convertir caracteres especiales de UTF-8 a Latin-1
const convertToLatin1 = (str: string): string => {
    return str
      .normalize("NFD") // Descompone los caracteres acentuados en combinaciones básicas
      .replace(/[\u0300-\u036f]/g, "") // Remueve los diacríticos (acentos)
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N")
      .replace(/ç/g, "c")
      .replace(/Ç/g, "C")
      .replace(/[¡¿]/g, ""); // Remueve signos de apertura de exclamación e interrogación
  };
  
  export default convertToLatin1;
  