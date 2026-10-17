---
name: view-design-standards
description: Guía de referencia de diseño UI/UX y estándar de estilos visuales para vistas y tablas en el panel web de Planigo, basada en TicketView y TicketTable.
---

# Guía de Estándar de Diseño UI/UX (Views y Tablas)

Este Skill define las especificaciones exactas de diseño, paleta de colores, tokens de Tailwind, paddings, border-radius, sombras, animaciones y componentes de UI que deben aplicarse en todas las pantallas principales (Views) y tablas de datos (Tables) del panel web de **Planigo**.

Se toma como referencia oficial la implementación en `src/pages/Ticket/views/TicketView.tsx` y `src/pages/Ticket/components/TicketTable.tsx`.

---

## 1. Layout Principal y Paddings de la Pantalla Completa

El contenedor general de una vista ocupa la altura total visible y aplica un layout flexible vertical.

```tsx
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="show"
  className="flex flex-col min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-108px)]"
>
  {/* Contenido de la vista */}
</motion.div>
```

### Animaciones de Contenedor (Framer Motion)
```typescript
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};
```

---

## 2. Encabezado Superior (Header Card)

El encabezado flotante superior contiene el icono descriptivo, el título de la vista, la descripción/subtítulo y el botón principal de acción.

```tsx
<motion.div
  variants={cardVariants}
  className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
>
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-slate-800 flex items-center">
        {/* Icono envuelto con fondo oscuro y bordes redondeados */}
        <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
          <FiActivity className="w-6 h-6" />
        </div>
        Título de la Pantalla
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Descripción secundaria detallando el propósito de la pantalla.
      </p>
    </div>

    {/* Botón Principal de Acción */}
    <button
      onClick={handleAction}
      className="flex items-center justify-center px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 flex-shrink-0"
    >
      <FiPlus className="w-4 h-4 mr-2 stroke-[3]" />
      Texto Acción Principal
    </button>
  </div>
</motion.div>
```

### Especificaciones del Encabezado
*   **Fondo y Forma**: `bg-white`, `rounded-[32px]` (esquinas ultra suaves).
*   **Sombra**: `shadow-[0_8px_30px_rgb(0,0,0,0.06)]`.
*   **Padding**: `px-6 py-6 md:px-8 md:py-8` (24px móvil, 32px en desktop).
*   **Icono de Título**:
    *   **Contenedor**: `p-2.5`, `rounded-2xl` (16px border-radius) con `shadow-sm`.
    *   **Fondo de Icono**: `bg-primary-dark` (`#202B34`).
    *   **Color de Icono**: `text-white`, tamaño `w-6 h-6`.
*   **Tipografía**:
    *   **Título (`<h1>`)**: `text-2xl` (24px), `font-bold`, `text-slate-800`.
    *   **Subtítulo (`<p>`)**: `text-sm` (14px), `text-gray-500`, `mt-1`.

---

## 3. Botones de Acción (Estilos Estándar)

### Botón Principal de Acción (ej: "Aperturar Ticket", "Crear")
*   **Fondo**: `bg-primary-dark` (`#202B34`).
*   **Texto e Icono**: `text-white`, `font-bold`, `text-sm`.
*   **Padding**: `px-8 py-3`.
*   **Border Radius**: `rounded-full` (Píldora total).
*   **Sombra**: `shadow-[0_4px_12px_rgba(32,43,52,0.25)]`.
*   **Micro-interacción**: `hover:opacity-90 active:scale-95 transition-all`.

### Botón Secundario de Control (ej: "Actualizar")
*   **Fondo**: `bg-primary-dark` (`#202B34`).
*   **Texto e Icono**: `text-white`, `font-semibold`, `text-sm`.
*   **Padding**: `px-5 py-2`.
*   **Border Radius**: `rounded-full`.
*   **Sombra**: `shadow-[0_4px_12px_rgba(32,43,52,0.25)]`.
*   **Micro-interacción**: `hover:opacity-90 active:scale-95 transition-all`.

---

## 4. Barra de Filtros y Pestanas (Tabs)

Se utiliza un selector tipo "segmented control" en formato píldora para alternar entre diferentes vistas o estados.

```tsx
<motion.div variants={cardVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0 mb-4">
  {/* Contenedor de Tabs */}
  <div className="flex bg-slate-100 p-1.5 gap-2 rounded-full flex-shrink-0">
    <button
      type="button"
      onClick={() => setTabFilter("all")}
      className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all active:scale-95 ${
        tabFilter === "all"
          ? "bg-white text-primary-gold shadow-sm"
          : "text-slate-500 hover:text-slate-700 bg-transparent"
      }`}
    >
      Todos los Registros
    </button>
    <button
      type="button"
      onClick={() => setTabFilter("my")}
      className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all active:scale-95 ${
        tabFilter === "my"
          ? "bg-white text-primary-gold shadow-sm"
          : "text-slate-500 hover:text-slate-700 bg-transparent"
      }`}
    >
      Mis Registros
    </button>
  </div>

  {/* Botón Actualizar */}
  <button
    onClick={handleRefresh}
    className="flex items-center bg-primary-dark text-white hover:opacity-90 transition-all text-sm font-semibold px-5 py-2 rounded-full shadow-[0_4px_12px_rgba(32,43,52,0.25)] active:scale-95"
  >
    <FiRefreshCw className="w-4 h-4 mr-2" />
    Actualizar
  </button>
</motion.div>
```

---

## 5. Tarjeta y Estilo Tal Cual de la Tabla

La tabla se monta sobre una tarjeta blanca flotante de esquinas suavizadas (`rounded-[32px]`) con separación entre filas.

```tsx
<div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 select-none">
  {/* Fila Superior de Controles */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-1 flex-shrink-0">
    
    {/* Selector Limitador de Registros */}
    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
      <span>Mostrar:</span>
      <div className="relative">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="appearance-none bg-primary-dark text-white font-bold px-4 py-1.5 pr-8 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-dark/40 shadow-sm cursor-pointer text-xs"
        >
          <option value={5} className="text-slate-800 font-semibold bg-white">5</option>
          <option value={10} className="text-slate-800 font-semibold bg-white">10</option>
          <option value={25} className="text-slate-800 font-semibold bg-white">25</option>
          <option value={50} className="text-slate-800 font-semibold bg-white">50</option>
        </select>
        <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white pointer-events-none w-3.5 h-3.5" />
      </div>
      <span>resultados por página</span>
    </div>

    {/* Buscador Píldora */}
    <div className="relative w-full sm:w-64">
      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 cursor-pointer" />
      <input
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all font-semibold"
      />
    </div>
  </div>

  {/* Estructura Pildórica de la Tabla */}
  <div className="flex-1 overflow-auto min-h-0 scrollbar-none">
    <table className="w-full border-separate border-spacing-y-4 text-center">
      <thead>
        <tr className="text-white text-xs font-bold uppercase tracking-wider">
          <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full cursor-pointer select-none transition-opacity hover:opacity-90">
            Columna 1
          </th>
          <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full cursor-pointer select-none transition-opacity hover:opacity-90">
            Columna 2
          </th>
          <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        {/* Filas de Datos */}
        <motion.tr
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
        >
          <td className="py-2 px-4 bg-[#FAFAFA] text-slate-800 text-sm font-bold first:rounded-l-full last:rounded-r-full">
            Dato 1
          </td>
          <td className="py-2 px-4 bg-[#FAFAFA] text-slate-600 text-sm font-semibold first:rounded-l-full last:rounded-r-full">
            Dato 2
          </td>
          <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
            {/* Botones de acción en celda */}
            <div className="flex items-center justify-center gap-2">
              <button className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm">
                <FiEye className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </motion.tr>
      </tbody>
    </table>
  </div>
</div>
```

### Especificaciones de la Tabla
*   **Separación entre Filas**: `border-separate border-spacing-y-4` (crea un efecto flotante por fila).
*   **Encabezados (`<th>`)**:
    *   **Fondo**: `bg-primary-gold` (`#FCB521`).
    *   **Texto**: `text-white`, `text-xs`, `font-bold`, `uppercase`, `tracking-wider`.
    *   **Forma de Píldora por Fila**: `first:rounded-l-full last:rounded-r-full`.
*   **Celdas de Datos (`<td>`)**:
    *   **Fondo Píldora de Fila**: `bg-[#FAFAFA]`.
    *   **Forma de Píldora**: `first:rounded-l-full last:rounded-r-full`.
    *   **Padding**: `py-2 px-4`.
    *   **Jerarquía Tipográfica (Peso de Fuente y Colores Livianos)**:
        *   **Identificador o Campo Clave (ID / Código / Nombre Principal)**: `text-slate-800 text-sm font-bold` (único elemento en negrita pesada de la fila).
        *   **Campos de Texto Secundarios (Correo, Teléfono, Descripción, Categoría, Ubicación)**: `text-slate-600 text-sm font-normal` (evitar `font-semibold` o `font-bold` generalizado para no recargar visualmente la fila).
        *   **Fechas y Marcas de Tiempo**: `text-slate-500 text-xs font-normal`.
        *   **Subetiquetas o Nombres de Usuario**: `text-slate-400 text-xs font-normal`.
    *   **Estilo de Badges de Estado y Roles**:
        *   Tono suave y liviano con padding compacto `px-2.5 py-0.5 rounded-full text-xs font-medium`.
        *   **Activo**: `bg-emerald-50 text-emerald-700 border border-emerald-200/60`.
        *   **Inactivo / Neutro**: `bg-slate-100 text-slate-500 border border-slate-200`.
        *   **Roles / Categorías**: `bg-amber-50 text-amber-700 border border-amber-200/60` o `bg-slate-100 text-slate-700`.
    *   **Avatar de Iniciales en Filas de Tabla**: No debe utilizar el color del registro de forma dinámica en las iniciales. El contenedor circular de iniciales de fila debe utilizar **siempre** la letra en color dorado (`text-primary-gold`) sobre un fondo del mismo color con opacidad (`bg-primary-gold/15`):
        ```tsx
        <div className="w-8 h-8 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center text-xs font-bold shrink-0">
          {name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        ```
*   **Botones de Acción en Celda**:
    *   **Tamaño**: `w-7 h-7` (cuadrados compactos de 28x28px).
    *   **Border Radius**: `rounded-lg` (8px).
    *   **Fondo**: `bg-primary-gold text-white`.
    *   **Efectos**: `hover:opacity-90 active:scale-95 shadow-sm`.

---

## 6. Estado de Carga (Shimmers / Skeletons)

Cuando la tabla está en estado de carga (`loading === true`), se renderizan 5 filas de prueba con una animación de pulso (`animate-pulse`).

```tsx
{loading ? (
  Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      {Array.from({ length: totalColumns }).map((_, j) => (
        <td key={j} className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
          <div className="h-4 bg-neutral-200 rounded w-16 mx-auto"></div>
        </td>
      ))}
    </tr>
  ))
) : (
  // Datos reales
)}
```

---

## 7. Controles de Paginación (Footer Controls)

Al pie de la tarjeta de la tabla se encuentra el contador de resultados y los botones circulares de navegación de página.

```tsx
<div className="mt-6 flex items-center justify-between flex-shrink-0 flex-wrap gap-4 pt-4 border-t border-slate-100">
  {/* Contador */}
  <div className="text-sm font-semibold text-slate-500">
    {`${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalDocs)} de ${totalDocs} resultados`}
  </div>

  {/* Botones de Navegación Circular */}
  <div className="flex items-center space-x-3">
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      <FiChevronLeft className="w-5 h-5 stroke-[2.5]" />
    </button>
    <div className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shadow-md select-none">
      {currentPage}
    </div>
    <button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      <FiChevronRight className="w-5 h-5 stroke-[2.5]" />
    </button>
  </div>
</div>
```

---

## 8. Resumen de Tokens de Diseño

| Elemento | Clases de Tailwind / Valor | Descripción |
| :--- | :--- | :--- |
| **Color Principal Oscuro** | `bg-primary-dark` (`#202B34`) | Botón principal de acción, botón actualizar y limitador de registros. |
| **Color Primario Dorado** | `bg-primary-gold` (`#FCB521`) | Encabezados `<th>`, tabs activos, iconos secundarios y paginación. |
| **Fondo de Tarjetas** | `bg-white` | Tarjetas flotantes principales. |
| **Fondo de Filas Tabla** | `bg-[#FAFAFA]` | Celdas individuales `<td>` pildóricas. |
| **Radius de Tarjetas** | `rounded-[32px]` | Esquinas principales de contenedores flotantes. |
| **Radius de Botones** | `rounded-full` | Botón principal, secundario y selectores. |
| **Radius Icono Header** | `rounded-2xl bg-primary-dark text-white` | Icono decorativo en título de encabezado. |
| **Sombra de Botones Oscuros**| `shadow-[0_4px_12px_rgba(32,43,52,0.25)]` | Sombra pronunciada para elementos `#202B34`. |
| **Sombra de Tarjetas** | `shadow-[0_8px_30px_rgb(0,0,0,0.06)]` | Sombra suave flotante para contenedores principales. |
