---
name: integrate-module-route
description: Ayuda a integrar nuevos módulos y páginas en el sistema de enrutamiento y permisos del panel web de Planigo.
---

# Integración de Rutas y Permisos

Este Skill instruye al agente sobre cómo registrar adecuadamente una nueva vista o módulo en la navegación y el sistema de permisos de la aplicación. Para que un módulo sea accesible, debe sincronizarse en tres archivos específicos utilizando un identificador (ID) de texto común.

## When to use this skill

- Usa este skill después de crear un nuevo módulo (carpeta en `src/pages/`) para integrarlo al menú lateral de navegación y al sistema de rutas con permisos de rol de la aplicación.
- Úsalo si un usuario reporta que un enlace del menú lateral no responde o redirige silenciosamente a `/login`.

## How to use it

La integración de un nuevo módulo requiere modificar tres archivos clave de manera sincronizada. Si se omite uno, la ruta se resolverá como `#` o redirigirá silenciosamente a `/login`.

### Paso 1: Mapeo de Roles a Claves de Permiso (`src/rolKeys/getRolKeys.tsx`)
En este archivo se asocia el nombre del menú con el código de permiso del backend (ej. `GUSU` para administradores de usuarios).
*   Abre [getRolKeys.tsx](file:///c:/Users/josue/Documents/Proyectos/Planigo/planigoWebApp/src/rolKeys/getRolKeys.tsx) e introduce la clave del nuevo módulo dentro de las funciones de utilidad pertinentes.
*   **Ejemplo**:
    ```typescript
    // En getRoleKeyByName
    case "priorityManager":
      return "GPRI"; // Clave del permiso del rol
    ```

### Paso 2: Mapeo de Enlaces URL (`src/route/routerLink/useMenuLinks.ts`)
Aquí se define el enlace (Path URL) al que el menú redirigirá al hacer clic.
*   Abre [useMenuLinks.ts](file:///c:/Users/josue/Documents/Proyectos/Planigo/planigoWebApp/src/route/routerLink/useMenuLinks.ts) y añade el caso del nuevo módulo en la función que asocia el nombre clave a la URL.
*   **Ejemplo**:
    ```typescript
    // En getLinkByName
    case "priorityManager":
      return "/priorities"; // URL del navegador
    ```

### Paso 3: Declaración de la Ruta Protegida (`src/route/Navigation.tsx`)
Aquí se registra la ruta del navegador, se le asocia la vista principal y se protege mediante el componente `<AccessibleRoute>` utilizando la verificación de permisos.
*   Abre [Navigation.tsx](file:///c:/Users/josue/Documents/Proyectos/Planigo/planigoWebApp/src/route/Navigation.tsx) y agrega la ruta protegida dentro de `RouteAdministration`.
*   **Ejemplo**:
    ```tsx
    <AccessibleRoute
      accesible={hasPermission(getRoleKeyByName("priorityManager"))}
      path={getLinkByName("priorityManager")}
      element={<PriorityView />}
    />
    ```

### Lista de Verificación de Integración
Al finalizar el registro, el agente debe verificar que:
- [ ] La cadena de identificación (ej. `priorityManager`) coincide exactamente en mayúsculas/minúsculas en los tres archivos.
- [ ] La ruta `/priorities` está permitida e importada correctamente.
- [ ] No existen problemas de tipado TypeScript ni dependencias circulares en las importaciones.
