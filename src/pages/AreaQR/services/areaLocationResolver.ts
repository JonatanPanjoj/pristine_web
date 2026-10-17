// src/pages/AreaQR/services/areaLocationResolver.ts
// Resolvedor centralizado de ubicación para Área:
// Relación: Área -> Sector -> Sede.
// Obtiene el nombre del Sector, el nombre de la Sede y la imagen (url_photo) de la Sede,
// convirtiendo la foto a data URL para que se visualice correctamente y se incruste
// en PDFs y PNGs sin problemas de CORS ni lienzos bloqueados.

import api from '../../../services/api';
import { getAllSedesFromCache, loadAndUpdateSedes } from '../../../services/sedeStorage';
import { Sede } from '../../../models/Sede';
import { Sector } from '../../../models/Sector';
import { loadPhoto, PhotoCache } from '../../../components/reportPhotoData';
import { db } from '../../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../../../constants/firestoreCollections';

export interface AreaLocationInfo {
  sectorName: string | null;
  sedeName: string | null;
  sedePhoto: string | null;
  sectorId: string | null;
  sedeId: string | null;
}

// Cachés en memoria durante la sesión
const sectorsMap = new Map<string, Sector>();
const sedesMap = new Map<string, Sede>();
const photoCache: PhotoCache = new Map();
const resolvedCache = new Map<string, AreaLocationInfo>();

let sectorsFetchPromise: Promise<Sector[]> | null = null;
let sedesFetchPromise: Promise<Sede[]> | null = null;

/**
 * Carga y cachea todos los sectores disponibles desde la API de MongoDB
 */
export async function getAllSectors(): Promise<Sector[]> {
  if (sectorsMap.size > 0 && !sectorsFetchPromise) {
    return Array.from(sectorsMap.values());
  }

  if (sectorsFetchPromise) {
    return sectorsFetchPromise;
  }

  sectorsFetchPromise = (async () => {
    try {
      const response = await api.get('/sectors');
      const sectorsList: Sector[] = (response.data?.sectors || []).map((s: any) => {
        const id = s.id || s._id;
        const sedeId = s.SedeId || s.sede_id || '';
        return {
          ...s,
          id,
          _id: id,
          SedeId: sedeId,
          sede_id: sedeId,
          name: s.name || '',
          is_enabled: s.is_enabled !== false && s.status !== false,
        };
      });

      sectorsList.forEach((s) => {
        if (s.id) sectorsMap.set(String(s.id), s);
        if ((s as any)._id) sectorsMap.set(String((s as any)._id), s);
        if (s.sector_id) sectorsMap.set(String(s.sector_id), s);
      });

      return sectorsList;
    } catch (err) {
      console.warn('[areaLocationResolver] Error obteniendo sectores de API:', err);
      return Array.from(sectorsMap.values());
    } finally {
      sectorsFetchPromise = null;
    }
  })();

  return sectorsFetchPromise;
}

/**
 * Carga y cachea todas las sedes disponibles desde la API o caché local
 */
export async function getAllSedes(): Promise<Sede[]> {
  // Primero revisamos si hay sedes en el almacenamiento local encriptado
  const cachedLocal = getAllSedesFromCache();
  if (cachedLocal && cachedLocal.length > 0) {
    cachedLocal.forEach((s) => {
      const id = s.id || (s as any)._id;
      if (id) sedesMap.set(String(id), s);
      if (s.sede_id) sedesMap.set(String(s.sede_id), s);
    });
  }

  if (sedesMap.size > 0 && !sedesFetchPromise) {
    return Array.from(sedesMap.values());
  }

  if (sedesFetchPromise) {
    return sedesFetchPromise;
  }

  sedesFetchPromise = (async () => {
    try {
      const response = await api.get('/sedes');
      const sedesList: Sede[] = (response.data?.sedes || []).map((s: any) => {
        const id = s.id || s._id;
        return {
          ...s,
          id,
          _id: id,
          name: s.name || '',
          url_photo: s.url_photo || null,
        };
      });

      sedesList.forEach((s) => {
        if (s.id) sedesMap.set(String(s.id), s);
        if ((s as any)._id) sedesMap.set(String((s as any)._id), s);
        if (s.sede_id) sedesMap.set(String(s.sede_id), s);
      });

      // Asegurar que también se actualice el storage local
      loadAndUpdateSedes().catch(() => {});

      return sedesList;
    } catch (err) {
      console.warn('[areaLocationResolver] Error obteniendo sedes de API:', err);
      return Array.from(sedesMap.values());
    } finally {
      sedesFetchPromise = null;
    }
  })();

  return sedesFetchPromise;
}

/**
 * Búsqueda sincrónica rápida basada en listas ya provistas o cachés existentes
 */
export function getQuickAreaLocation(
  area: any,
  providedSedes: Sede[] = [],
  providedSectors: Sector[] = []
): AreaLocationInfo {
  // 1. Identificar sectorId
  const sectorId = area.SectorId || area.sector_id || null;

  // 2. Buscar sector en listas provistas o caché
  let sector: Sector | null = null;
  if (sectorId) {
    const sIdStr = String(sectorId);
    sector =
      providedSectors.find((s) => s.id === sIdStr || (s as any)._id === sIdStr || s.sector_id === sIdStr) ||
      sectorsMap.get(sIdStr) ||
      null;
  }

  const sectorName = sector?.name || area.sectorName || null;

  // 3. Determinar sedeId a partir del sector (Área -> Sector -> Sede)
  let targetSedeId: string | null =
    sector?.SedeId || (sector as any)?.sede_id || null;

  // Si el sector no tiene sedeId directa, buscar si alguna sede lista este sector
  if (!targetSedeId && sectorId) {
    const allSedes = [...providedSedes, ...Array.from(sedesMap.values())];
    const matchingSedeBySector = allSedes.find(
      (s) => Array.isArray(s.sector) && s.sector.some((secId) => String(secId) === String(sectorId))
    );
    if (matchingSedeBySector) {
      targetSedeId = matchingSedeBySector.id || (matchingSedeBySector as any)._id || matchingSedeBySector.sede_id;
    }
  }

  // Fallback si el área ya tenía sede_id directamente
  if (!targetSedeId) {
    targetSedeId = area.SedeId || area.sede_id || null;
  }

  // 4. Buscar Sede
  let matchingSede: Sede | null = null;
  if (targetSedeId) {
    const sedeIdStr = String(targetSedeId);
    const allSedes = [...providedSedes, ...Array.from(sedesMap.values())];
    matchingSede =
      allSedes.find((s) => s.id === sedeIdStr || (s as any)._id === sedeIdStr || s.sede_id === sedeIdStr) ||
      sedesMap.get(sedeIdStr) ||
      null;
  }

  const sedeName = matchingSede?.name || area.sedeName || null;
  const rawPhoto = matchingSede?.url_photo || null;
  const sedePhoto = (rawPhoto ? photoCache.get(rawPhoto) : null) || rawPhoto || null;

  return {
    sectorName,
    sedeName,
    sedePhoto,
    sectorId: sectorId ? String(sectorId) : null,
    sedeId: targetSedeId ? String(targetSedeId) : null,
  };
}

/**
 * Resuelve asincrónicamente la relación Área -> Sector -> Sede.
 * Busca el sector, la sede y su imagen (url_photo), convirtiendo la imagen
 * a Data URL en memoria para su visualización y renderizado en PDF.
 */
export async function resolveAreaLocation(
  area: any,
  providedSedes: Sede[] = [],
  providedSectors: Sector[] = []
): Promise<AreaLocationInfo> {
  const areaKey = `${area.id || area._id || area.area_id}_${area.SectorId || area.sector_id || ''}_${area.SedeId || area.sede_id || ''}`;

  // Registrar elementos provistos en cachés
  if (providedSedes && providedSedes.length > 0) {
    providedSedes.forEach((s) => {
      const id = s.id || (s as any)._id;
      if (id) sedesMap.set(String(id), s);
      if (s.sede_id) sedesMap.set(String(s.sede_id), s);
    });
  }

  if (providedSectors && providedSectors.length > 0) {
    providedSectors.forEach((s) => {
      const id = s.id || (s as any)._id;
      if (id) sectorsMap.set(String(id), s);
      if (s.sector_id) sectorsMap.set(String(s.sector_id), s);
    });
  }

  const sectorId = area.SectorId || area.sector_id || null;

  // 1. Buscar Sector
  let sector: Sector | null = null;
  if (sectorId) {
    const sIdStr = String(sectorId);
    sector = sectorsMap.get(sIdStr) || null;

    if (!sector) {
      // Intentar cargar todos los sectores de la API
      const allSectors = await getAllSectors();
      sector = allSectors.find((s) => s.id === sIdStr || (s as any)._id === sIdStr || s.sector_id === sIdStr) || null;
    }

    // Fallback a Firestore si la API REST no devolvió el sector
    if (!sector) {
      try {
        const sectorRef = doc(db, FIRESTORE_COLLECTIONS.CORE_SECTORS, sIdStr);
        const snapshot = await getDoc(sectorRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          const newSector: Sector = {
            id: snapshot.id,
            name: data.name || '',
            SedeId: data.SedeId || data.sede_id || '',
            is_enabled: data.is_enabled !== false && data.status !== false,
            sec_Area: data.sec_Area || [],
            sector_id: data.sector_id || snapshot.id,
          };
          sector = newSector;
          sectorsMap.set(sIdStr, newSector);
        }
      } catch {
        // Ignorar error de Firestore si no está disponible
      }
    }
  }

  const sectorName = sector?.name || area.sectorName || null;

  // 2. Determinar la Sede (Área -> Sector -> Sede)
  let targetSedeId: string | null =
    sector?.SedeId || (sector as any)?.sede_id || null;

  // Fallback 1: Buscar si alguna sede tiene este sector en su array `sector`
  if (!targetSedeId && sectorId) {
    await getAllSedes();
    for (const s of sedesMap.values()) {
      if (Array.isArray(s.sector) && s.sector.some((secId) => String(secId) === String(sectorId))) {
        targetSedeId = s.id || (s as any)._id || s.sede_id;
        break;
      }
    }
  }

  // Fallback 2: Área directamente con SedeId
  if (!targetSedeId) {
    targetSedeId = area.SedeId || area.sede_id || null;
  }

  // 3. Buscar la Sede
  let sede: Sede | null = null;
  if (targetSedeId) {
    const sedeIdStr = String(targetSedeId);
    sede = sedesMap.get(sedeIdStr) || null;

    if (!sede) {
      const allSedes = await getAllSedes();
      sede = allSedes.find((s) => s.id === sedeIdStr || (s as any)._id === sedeIdStr || s.sede_id === sedeIdStr) || null;
    }

    // Fallback a Firestore si no se encontró en API
    if (!sede) {
      try {
        const sedeRef = doc(db, FIRESTORE_COLLECTIONS.CORE_SEDES, sedeIdStr);
        const snapshot = await getDoc(sedeRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          sede = {
            id: snapshot.id,
            sede_id: data.sede_id || snapshot.id,
            name: data.name || '',
            department: data.department || '',
            municipality: data.municipality || '',
            address: data.address || '',
            zone: data.zone || '',
            latitude: data.latitude || '',
            length: data.length || '',
            sector: data.sector || [],
            url_photo: data.url_photo || null,
            is_enabled: data.is_enabled !== false && data.status !== false,
            updatedAt: data.updatedAt,
          };
          sedesMap.set(sedeIdStr, sede);
        }
      } catch {
        // Ignorar error de Firestore si no está disponible
      }
    }
  }

  const sedeName = sede?.name || area.sedeName || null;
  const rawPhoto = sede?.url_photo || null;

  // 4. Preparar la foto para PDF y visualización
  let sedePhoto: string | null = rawPhoto;
  if (rawPhoto) {
    try {
      const dataUrl = await loadPhoto(rawPhoto, photoCache);
      if (dataUrl) {
        sedePhoto = dataUrl;
      }
    } catch (err) {
      console.warn('[areaLocationResolver] No se pudo convertir foto a data URL:', err);
    }
  }

  const result: AreaLocationInfo = {
    sectorName,
    sedeName,
    sedePhoto,
    sectorId: sectorId ? String(sectorId) : null,
    sedeId: targetSedeId ? String(targetSedeId) : null,
  };

  resolvedCache.set(areaKey, result);
  return result;
}
