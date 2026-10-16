import { useState } from 'react';

const useEncryptDecrypt = () => {
    const [error, setError] = useState<string | null>(null);

    const substrReact = (str: string, start: number, length: number): string => {
        if (start < 0) {
            str = str.split('').reverse().join('');
            start = -1 * start - 1;
            return str.slice(start, start + length);
        }
        return length === undefined ? str.slice(start) : str.slice(start, start + length);
    };

    const encrypt = (string: string, key: string): string => {
        try {
            let result = '';
            for (let i = 0; i < string.length; i++) {
                const char = string.charAt(i);
                const keyChar = substrReact(key, (i % key.length) - 1, 1);
                const encryptedChar = String.fromCharCode(char.charCodeAt(0) + keyChar.charCodeAt(0));
                result += encryptedChar;
            }
            return btoa(result); // Codificación en Base64
        } catch (err) {
            setError('Error en cifrado');
            return '';
        }
    };

    const decrypt = (string: string, key: string): string => {
        try {
            let result = '';
            const decodedString = atob(string); // Decodificación desde Base64
            for (let i = 0; i < decodedString.length; i++) {
                const char = decodedString.charAt(i);
                const keyChar = substrReact(key, (i % key.length) - 1, 1);
                const decryptedChar = String.fromCharCode(char.charCodeAt(0) - keyChar.charCodeAt(0));
                result += decryptedChar;
            }
            return result;
        } catch (err) {
            setError('Error en descifrado');
            return '';
        }
    };

    return { encrypt, decrypt, error };
};

export default useEncryptDecrypt;
