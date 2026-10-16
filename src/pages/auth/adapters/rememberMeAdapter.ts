const REMEMBER_ME_KEY = "pristine_remembered_user";

export const rememberMeAdapter = {
  getRememberedUser: (): string => {
    try {
      return localStorage.getItem(REMEMBER_ME_KEY) || "";
    } catch (e) {
      console.error("Error leyendo de localStorage", e);
      return "";
    }
  },
  
  saveRememberedUser: (username: string): void => {
    try {
      localStorage.setItem(REMEMBER_ME_KEY, username);
    } catch (e) {
      console.error("Error guardando en localStorage", e);
    }
  },
  
  clearRememberedUser: (): void => {
    try {
      localStorage.removeItem(REMEMBER_ME_KEY);
    } catch (e) {
      console.error("Error eliminando de localStorage", e);
    }
  }
};
