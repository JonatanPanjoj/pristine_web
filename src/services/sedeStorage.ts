// src/services/sedeStorage.ts
import api from "./api";
import CryptoJS from "crypto-js";
import { Sede } from "../models/Sede";

const CACHE_KEY_SEDES = "cachedSedes";
const secretKey = process.env.REACT_APP_KEYENCRIPT || "PristineSecurityKey2026AES";

function encryptData(data: unknown): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

function decryptData(encrypted: string): unknown {
  const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

function saveToLocalStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, encryptData(data));
  } catch (err) {
    console.error(`[sedeStorage] Error al guardar "${key}" en localStorage:`, err);
  }
}

function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return decryptData(raw) as T;
  } catch (err) {
    console.error(`[sedeStorage] Error al leer "${key}" de localStorage:`, err);
    localStorage.removeItem(key);
    return null;
  }
}

export async function loadAndUpdateSedes(): Promise<void> {
  try {
    const response = await api.get('/sedes');
    const sedes: Sede[] = response.data?.sedes || [];
    saveToLocalStorage(CACHE_KEY_SEDES, sedes);
    console.log(`[sedeStorage] ${sedes.length} sedes sincronizadas en caché local.`);
  } catch (error) {
    console.error("[sedeStorage] Error al sincronizar sedes desde MongoDB API:", error);
  }
}

export function getAllSedesFromCache(): Sede[] | null {
  return loadFromLocalStorage<Sede[]>(CACHE_KEY_SEDES);
}

export function applyUserSedesToCache(userId: string, sedeIds: string[]): void {
  const cached = getAllSedesFromCache();
  if (!cached) return;

  const assigned = new Set(sedeIds);
  const updated = cached.map((sede) => {
    const ids = new Set(sede.user_ids ?? []);
    if (assigned.has(sede.id)) ids.add(userId);
    else ids.delete(userId);

    return { ...sede, user_ids: [...ids] };
  });

  saveToLocalStorage(CACHE_KEY_SEDES, updated);
}