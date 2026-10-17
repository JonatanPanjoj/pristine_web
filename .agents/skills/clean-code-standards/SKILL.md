---
name: clean-code-standards
description: Asegura que cualquier código generado o modificado siga los estándares de Clean Code del proyecto (SRP, DIP, ISP, DRY, Ley de Demeter y abstracción de límites).
---

# Estándares de Código Limpio (Clean Code)

Este Skill instruye al agente a actuar como mentor y guardián de la calidad de software en el panel web de Planigo. Su propósito es garantizar que todo cambio o creación de código cumpla con las reglas esenciales de código limpio especificadas en el proyecto.

## When to use this skill

- Úsalo de manera transversal siempre que vayas a escribir, refactorizar o evaluar código en el proyecto.
- Sirve como una lista de verificación previa a la confirmación de cambios para asegurar la mantenibilidad a largo plazo.

## How to use it

El agente debe estructurar su razonamiento y generación de código aplicando las siguientes directrices extraídas del sistema:

### 1. Abstracción de Límites (Boundary Abstraction & DIP)
- **Principio**: Es aconsejable depender de algo que controlemos antes que de algo externo.
- **Acción**: Nunca importes APIs de terceros (Firebase, Firestore, librerías de fechas, gráficos) directamente en las pantallas o componentes visuales (`/pages/` o `/components/`).
- **Encapsulamiento**: Envuelve estas herramientas detrás de adaptadores (`adapters/`) o Custom Hooks (`hooks/`), ocultando los entresijos técnicos al cliente de UI.

### 2. Estructura Vertical (Metáfora del Periódico & Coherent Format)
- **Principio**: Un archivo de código debe leerse de arriba a abajo como un artículo de prensa.
- **Estructura jerárquica**:
  1. **El Titular (Parte superior)**: Importaciones e interfaces de TypeScript.
  2. **La Sinopsis (Cuerpo)**: El componente principal de React o exportación principal.
  3. **Los Detalles (Parte inferior)**: Funciones auxiliares, sub-componentes privados y estilos auxiliares.
- **Flujo de lectura**: Si la función `A` llama a la función `B`, sitúa la definición de `B` físicamente por debajo de `A`.

### 3. Funciones y Bloques Reducidos (Small Code Blocks & SRP)
- **Principio**: Las funciones y componentes deben ser de tamaño reducido y hacer una sola cosa.
- **Restricción**: Mantén las funciones en aproximadamente **20 líneas de código**.
- **Indentación**: El nivel de sangrado no debe superar **uno o dos niveles**. Evita estructuras profundamente anidadas (ej. `if` dentro de `map` dentro de `if`).
- **Extracción de JSX**: Si un bloque dentro de un `.map()` o condición supera las 3-4 líneas, extráelo a un sub-componente descriptivo.

### 4. Nombres Expresivos y Buscables (Expressive Naming)
- **Principio**: Los nombres deben revelar la intención del desarrollador sin requerir comentarios aclaratorios.
- **Reglas**:
  - **Componentes**: Sustantivos (ej. `UserCard`, `PriorityForm`). Evita sufijos como `Manager` o `Info`.
  - **Funciones**: Verbos (ej. `addNewPriority`, `toggleStatus`).
  - **Interfaces**: No uses el prefijo `I` (ej. usa `Priority` en lugar de `IPriority`).
  - **Constantes**: Reemplaza números o valores visuales mágicos con constantes descriptivas en mayúsculas (ej. `PAGE_SIZE = 10`).

### 5. Ley de Demeter y Datos vs Objetos (Law of Demeter)
- **Principio**: Un módulo no debe conocer los entresijos de los objetos que manipula para evitar el "choque de trenes".
- **Restricción**: Evita encadenamientos profundos de puntos en componentes (ej. `user.profile.settings.theme.color`). 
- **Acción**: El objeto o servicio colaborador inmediato debe proveer una propiedad o método de conveniencia directa (ej. `user.getThemeColor()`). Los modelos son DTOs (estructuras de datos pasivas), mientras que los hooks o servicios son objetos con comportamiento activo.

### 6. Centralización de Diseño y Estilos (DRY)
- **Principio**: Evita la duplicación de código e inconsistencias visuales de diseño.
- **Acción**: Nunca uses colores hexadecimales crudos ni colores por defecto de Tailwind CSS (como `blue-500` o `red-600`) en tus archivos de React. Los colores de la aplicación se obtienen **exclusivamente** de los tokens semánticos definidos en [tailwind.config.js](file:///c:/Users/josue/Documents/Proyectos/Planigo/planigoWebApp/tailwind.config.js).
- **Paleta de Colores Autorizada en tailwind.config.js**:
  * `primary` (ej. `bg-primary`, `bg-primary-dark`, `text-primary-gold`)
  * `surface` (ej. `bg-surface-app` para el fondo de pantalla, `text-surface-700`, `text-surface-900`)
  * `action` (para botones y enlaces principales, ej. `bg-action`, `hover:bg-action-700`)
  * `accent` (para elementos secundarios, ej. `bg-accent`, `text-accent-700`)
  * `danger` (para estados de error, ej. `bg-danger`, `text-danger-700`)
  * `warning` (para advertencias, ej. `bg-warning`)
  * `success` (para confirmaciones exitosas, ej. `bg-success-200`, `text-success-700`)
  * `attention` (amarillos de soporte, ej. `bg-attention-400`)
  * `neutral` (reemplaza a los grises genéricos, ej. `text-neutral-900` para títulos, `text-neutral-700` para texto de cuerpo)
- **Migración**: Si heredas o editas código legacy que use clases de Tailwind genéricas de color (como `orange-500` o `gray-900`), mígralas de inmediato a los tokens semánticos de la corporación configurados en [tailwind.config.js](file:///c:/Users/josue/Documents/Proyectos/Planigo/planigoWebApp/tailwind.config.js).

### 7. Limpieza del Entorno (Regla del Boy Scout)
- **Principio**: Deja el campamento de código más limpio de lo que lo encontraste.
- **Reglas**:
  - **Prohibido el código comentado**: Elimina cualquier bloque de código comentado; Git se encargará del historial.
  - **Eliminar código muerto**: Bórralo si una variable, importación o tipo de TS ya no se usa.
  - **Sin comentarios obvios**: No comentes cosas que el código autodocumentado ya explica.
