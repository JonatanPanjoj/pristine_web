import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser, setError } from "../../../store/userSlice";
import { getUserByCredentials, getRoleById, getPermissionsByIds } from "../adapters/firebaseAdapter";
import { useTranslation } from "react-i18next";
import useEncryptDecrypt from "../../../hooks/encrypt/useEncryptDecrypt";
import { rememberMeAdapter } from "../adapters/rememberMeAdapter";

export const useLogin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { encrypt } = useEncryptDecrypt();

  const login = async (name: string, password: string, remember: boolean) => {
    try {
      const encryptedPassword = encrypt(password, name);
      const userData = await getUserByCredentials(name, encryptedPassword);

      if (!userData) {
        setErrorMessage(t("login.incorrect_credentials"));
        return false;
      }

      const isUserEnabled = userData.is_enabled !== undefined ? userData.is_enabled : userData.status !== false;
      if (!isUserEnabled) {
        setErrorMessage(t("login.user_disabled"));
        return false;
      }

      let permissions: string[] = (userData.permissions && userData.permissions.length > 0)
        ? userData.permissions
        : [];
      let roleName = userData.rol_name || "";

      if (permissions.length === 0 && userData.rol) {
        const roleData = await getRoleById(userData.rol);
        if (roleData) {
          roleName = roleData.name || roleName;
          permissions = await resolvePermissions(userData, roleData);
        }
      }

      if (permissions.length === 0) {
        setErrorMessage(t("login.no_permissions"));
        return false;
      }

      if (remember) {
        rememberMeAdapter.saveRememberedUser(name);
      } else {
        rememberMeAdapter.clearRememberedUser();
      }

      let createdAtStr = new Date().toISOString();
      if (typeof userData.created_at === 'string') {
        createdAtStr = userData.created_at;
      } else if (userData.created_at?.toDate) {
        createdAtStr = userData.created_at.toDate().toISOString();
      }

      dispatch(
        setUser({
          ...userData,
          status: true,
          is_enabled: true,
          created_at: createdAtStr,
          rol_name: roleName,
          permissions,
        })
      );
      setIsLoggedIn(true);
      setErrorMessage("");
      navigate("/", { replace: true });
      return true;
    } catch (error) {
      console.error("Error al procesar login:", error);
      dispatch(setError(t("login.error")));
      setErrorMessage(t("login.error"));
      return false;
    }
  };

  return { isLoggedIn, errorMessage, login };
};

/**
 * Los permisos del usuario, en claves.
 *
 * Manda lo que el usuario lleva encima; el rol solo se consulta cuando no tiene
 * asignación propia, y entonces actúa como plantilla. Es el orden que pide la
 * base migrada: allí existe un rol llamado "Asignación Libre" que no concede
 * nada, precisamente porque sus usuarios tienen los permisos a medida.
 *
 * Por eso tampoco se exige que el rol exista. Antes, un rol borrado dejaba al
 * usuario sin poder entrar aunque tuviera todos sus permisos asignados.
 */
const resolvePermissions = async (
  userData: { permissions?: string[] },
  roleData: { permissions?: string[] } | null
): Promise<string[]> => {
  if (userData.permissions?.length) return userData.permissions;
  if (!roleData?.permissions?.length) return [];

  // El rol guarda ids de documento, así que hay que traducirlos a claves.
  return getPermissionsByIds(roleData.permissions);
};
