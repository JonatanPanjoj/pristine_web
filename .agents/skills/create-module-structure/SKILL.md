---
name: create-module-structure
description: Guía al agente en la creación y estructuración de nuevos módulos/páginas en el proyecto, siguiendo el patrón de carpetas adapters, hooks, components y views, y utilizando Firebase Firestore.
---

# Creación de Estructura de Módulos (DDD-ish)

Este Skill define las directrices y plantillas que un agente de IA debe seguir al crear un nuevo módulo de página o funcionalidad en el panel web de Planigo. La arquitectura sigue un enfoque guiado por el dominio (DDD-ish) encapsulando el acceso a datos, lógica de negocio y presentación.

## When to use this skill

- Usa este skill cuando el usuario te pida crear una nueva funcionalidad, pantalla, CRUD o panel de administración en el proyecto.
- Úsalo para asegurarte de que los archivos nuevos respetan las convenciones de estructuración y dependencias de la aplicación.

## How to use it

Al crear una nueva funcionalidad llamada `<Feature>` (por ejemplo, `Priority`), debes crear una carpeta dentro de `src/pages/<Feature>/` y organizar el código en las siguientes subcarpetas y archivos:

### 1. Definición del Modelo (Estructura de Datos Pura)
Antes de crear cualquier lógica, define la interfaz de datos en `src/models/<Feature>.ts`. 
*   **Regla**: Debe ser una interfaz TypeScript pura. No debe contener métodos, cálculos ni lógica de negocio.
*   **Ejemplo**:
    ```typescript
    export interface Priority {
      id: string;
      name: string;
      is_enabled: boolean;
      updatedAt?: any;
    }
    ```

### 2. Capa de Adaptadores (`src/pages/<Feature>/adapters/`)
Los adaptadores son los únicos responsables de realizar consultas directas a Firebase Firestore o APIs externas. Ningún componente o hook de UI debe importar directamente funciones de Firestore (`getDocs`, `setDoc`, etc.).
*   **Ejemplo de adaptador de lectura con paginación y búsqueda (`getAll<Feature>sAdapter.ts`)**:
    ```typescript
    import { db } from "../../../services/firebase";
    import { <Feature> } from "../../../models/<Feature>";
    import {
      collection,
      getDocs,
      query,
      where,
      limit,
      startAfter,
      startAt,
      orderBy,
      QueryDocumentSnapshot,
      getCountFromServer,
    } from "firebase/firestore";

    const featureCollection = collection(db, "<Feature>");

    interface GetOptions {
      searchFields?: Partial<Omit<<Feature>, "id">>;
      orderByField?: keyof <Feature>;
      orderDirection?: "asc" | "desc";
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot | null;
      startAtDoc?: QueryDocumentSnapshot | null;
      pageIndex?: number;
      isNext?: boolean;
    }

    export const getAll<Feature>sAdapter = async (options: GetOptions = {}) => {
      const {
        searchFields = {},
        orderByField = "name",
        orderDirection = "asc",
        pageSize = 10,
        startAfterDoc = null,
        startAtDoc = null,
        pageIndex = 1,
        isNext = true,
      } = options;

      // Obtener conteo total
      const totalDocsSnapshot = await getCountFromServer(query(featureCollection));
      const totalDocs = totalDocsSnapshot.data().count;
      const totalPages = Math.ceil(totalDocs / pageSize);

      let q = query(
        featureCollection,
        orderBy(orderByField as string, orderDirection),
        limit(pageSize)
      );

      // Lógica de búsqueda si searchFields contiene campos
      if (Object.keys(searchFields).length > 0) {
        let results: <Feature>[] = [];
        for (const [key, value] of Object.entries(searchFields)) {
          if (value) {
            const fieldQuery = query(featureCollection, where(key, "==", value));
            const exactMatchDocs = await getDocs(fieldQuery);
            exactMatchDocs.forEach((doc) => {
              results.push({ id: doc.id, ...doc.data() } as <Feature>);
            });
          }
        }
        // Retornar resultados filtrados en memoria (eliminar duplicados si aplica)
        const paginatedResults = results.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        return {
          items: paginatedResults,
          lastVisible: null,
          firstVisible: null,
          totalDocs: results.length,
          totalPages: Math.ceil(results.length / pageSize),
        };
      }

      // Paginación
      if (isNext && startAfterDoc) {
        q = query(q, startAfter(startAfterDoc), limit(pageSize));
      } else if (!isNext && startAtDoc) {
        q = query(q, startAt(startAtDoc), limit(pageSize));
      }

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as <Feature>));

      return {
        items,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        firstVisible: snapshot.docs[0] || null,
        totalDocs,
        totalPages,
      };
    };
    ```
*   **Otros adaptadores**: Crea `create<Feature>.ts` y `edit<Feature>ByIdAdapter.ts` para operaciones de escritura aisladas.

### 3. Capa de Hooks (`src/pages/<Feature>/hooks/`)
Los hooks consumen los adaptadores, administran los estados de carga (`loading`), error (`error`) y paginación, y exponen estos estados de forma limpia a las vistas o componentes.
*   **Ejemplo de Hook de consulta (`useFetch<Feature>s.ts`)**:
    ```typescript
    import { useState, useEffect } from "react";
    import { getAll<Feature>sAdapter } from "../adapters/getAll<Feature>sAdapter";
    import { <Feature> } from "../../../models/<Feature>";
    import { QueryDocumentSnapshot } from "firebase/firestore";

    export const useFetch<Feature>s = (options: { searchFields?: any; pageSize?: number } = {}) => {
      const [items, setItems] = useState<<Feature>[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [totalDocs, setTotalDocs] = useState(0);
      const [totalPages, setTotalPages] = useState(0);
      const [currentPage, setCurrentPage] = useState(1);
      const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
      const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot | null>(null);
      const [previousPages, setPreviousPages] = useState<QueryDocumentSnapshot[]>([]);

      const fetchItems = async (pageIndex: number, startAfterDoc: any = null, isNext = true) => {
        setLoading(true);
        setError(null);
        try {
          const res = await getAll<Feature>sAdapter({
            searchFields: options.searchFields,
            pageSize: options.pageSize || 10,
            startAfterDoc,
            pageIndex,
            isNext,
          });

          setCurrentPage(pageIndex);
          setItems(res.items);
          setLastVisible(res.lastVisible);
          setFirstVisible(res.firstVisible);
          setTotalDocs(res.totalDocs);
          setTotalPages(res.totalPages);

          if (isNext && res.firstVisible) {
            setPreviousPages((prev) => [...prev, res.firstVisible]);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error al obtener datos");
        } finally {
          setLoading(false);
        }
      };

      const loadPage = (pageIndex: number) => {
        if (!loading && pageIndex !== currentPage) {
          if (pageIndex > currentPage) {
            fetchItems(pageIndex, lastVisible, true);
          } else {
            const previousPageDoc = previousPages[previousPages.length - (currentPage - pageIndex + 1)] || null;
            setPreviousPages((prev) => prev.slice(0, -(currentPage - pageIndex)));
            fetchItems(pageIndex, previousPageDoc, false);
          }
        }
      };

      useEffect(() => {
        fetchItems(1);
      }, [options.searchFields]);

      return { items, loading, error, currentPage, totalPages, totalDocs, loadPage };
    };
    ```

### 4. Capa de Componentes Locales (`src/pages/<Feature>/components/`)
Aquí se sitúan los formularios y tablas que se consumen en la vista principal. Deben delegar el manejo de peticiones de red y lógica a los hooks correspondientes.
*   **Uso de componentes genéricos**: Reutiliza componentes de `src/components/` como `DataTable`, `Pagination`, `Loader`, `ConfirmationModal`, y `Modal` para mantener la consistencia estética y de comportamiento.

### 5. Capa de Vista Principal (`src/pages/<Feature>/views/`)
La vista principal monta la estructura HTML del contenedor, gestiona el estado local simple (como el término de búsqueda actual) y enlaza los componentes de tabla y formulario.
*   **Regla**: Debe ubicarse en `src/pages/<Feature>/views/<Feature>View.tsx`.
