---
name: dashboard-design-standards
description: Guía de referencia de diseño UI/UX y estándar de estilos visuales para Dashboards y Paneles Analíticos en el panel web de Planigo, basada en HelpDeskDashboardView.
---

# Guía de Estándar de Diseño UI/UX (Dashboards y Analítica)

Este Skill define las especificaciones exactas de diseño, paleta de colores, tokens de Tailwind, paddings, border-radius, sombras, animaciones, filtros en cascada, tarjetas de KPIs y gráficos analíticos (Recharts) que deben aplicarse en todos los **Dashboards** y paneles métricos del panel web de **Planigo**.

Se toma como referencia oficial la implementación en `src/pages/HelpDeskDashboard/views/HelpDeskDashboardView.tsx` y sus componentes dedicados (`KPICard.tsx`, `Card.tsx`, `DashboardFilters.tsx`, `Badge.tsx`).

> [!IMPORTANT]
> **REGLA ESTRICTA DE BORDES EN TARJETAS**: Todas las tarjetas de un Dashboard (Header, Filtros, Estatus dinámicos, Tarjetas de KPIs y Contenedores de Gráficas) **NO deben llevar bordes** (`border-0` o ausencia de clases `border`). La separación y estructura visual de las tarjetas flotantes se logra exclusivamente mediante el border-radius (`rounded-[32px]`), sombras suavizadas (`shadow-[0_8px_30px_rgba(0,0,0,0.06)]`) y el fondo blanco puro (`bg-white`).

---

## 1. Layout Principal y Animaciones del Dashboard

El contenedor general del dashboard aplica un espaciado vertical dinámico (`space-y-6`) con animación escalonada (stagger) para la entrada progresiva de sus bloques.

```tsx
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="show"
  className="space-y-6 pb-8"
>
  {/* Contenido del Dashboard */}
</motion.div>
```

### Variantes de Animación (Framer Motion)
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
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};
```

---

## 2. Encabezado Superior (Header Card)

El encabezado flotante del dashboard contiene el título del panel con un icono destacado en color dorado primario y un indicador de actualización en tiempo real con efecto de pulso. Sin bordes (`border-0`).

```tsx
<motion.div
  variants={cardVariants}
  className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
>
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-slate-800 flex items-center">
        <FiActivity className="w-6 h-6 mr-3 text-primary-gold" />
        Helpdesk (Tickets)
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Resolución de tickets, cumplimiento SLA y carga operativa en tiempo real
      </p>
    </div>
    
    {/* Badge de estado de actualización en tiempo real */}
    <div className="text-xs text-slate-500 font-bold bg-slate-50 px-4 py-2 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5 select-none self-start sm:self-center">
      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      Actualizado: {new Date(stats.lastUpdatedAt).toLocaleTimeString()}
    </div>
  </div>
</motion.div>
```

### Especificaciones del Encabezado
*   **Fondo y Forma**: `bg-white`, `rounded-[32px]` (esquinas redondeadas suave de 32px), **sin borde** (`border-0`).
*   **Sombra**: `shadow-[0_8px_30px_rgba(0,0,0,0.06)]`.
*   **Padding**: `px-6 py-6 md:px-8 md:py-8`.
*   **Icono de Título**: `w-6 h-6`, color `text-primary-gold` (`#FCB521`).
*   **Badge de Tiempo Real**: `bg-slate-50 border border-slate-100 rounded-full px-4 py-2 text-xs font-bold text-slate-500 shadow-sm`, con un indicador circular `w-2 h-2 bg-emerald-500 rounded-full animate-pulse`.

---

## 3. Panel de Filtros Colapsable (`DashboardFilters`)

Se utiliza un acordeón flotante redondeado con cabecera en color dorado principal y selects de React-Select estilizados como píldoras. El contenedor exterior **no lleva bordes** (`border-0`).

```tsx
<div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 mb-6 flex flex-col">
  {/* Botón de cabecera colapsable */}
  <button
    type="button"
    onClick={() => setIsExpanded(!isExpanded)}
    className={`w-full bg-primary-gold px-6 py-4 font-bold text-white text-[14px] flex items-center justify-between transition-all focus:outline-none hover:opacity-95 ${
      isExpanded ? "rounded-t-[32px]" : "rounded-[32px]"
    }`}
  >
    <div className="flex items-center gap-2">
      <FiFilter className="w-4 h-4" />
      <span>Filtros de búsqueda (Opcionales)</span>
    </div>
    {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
  </button>

  {/* Formulario de Filtros */}
  {isExpanded && (
    <form onSubmit={handleSubmit} className="p-5 space-y-4 border-t border-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Controles de Select / Input de Fecha */}
      </div>

      {/* Acciones de Filtro */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-95 text-center"
        >
          Limpiar
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-xs font-bold text-white bg-primary-gold hover:opacity-90 rounded-full transition-all active:scale-95 text-center shadow-[0_4px_12px_rgba(221,152,3,0.15)]"
        >
          Buscar
        </button>
      </div>
    </form>
  )}
</div>
```

### Estilos Personalizados para React-Select en Filtros
```typescript
const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: "9999px",
    borderColor: state.isFocused ? "#FCB521" : "#E2E8F0",
    boxShadow: state.isFocused ? "0 0 0 1px #FCB521" : "none",
    "&:hover": { borderColor: "#FCB521" },
    fontSize: "12px",
    minHeight: "36px",
    backgroundColor: "white",
    paddingLeft: "8px",
    paddingRight: "8px",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#FCB521"
      : state.isFocused
      ? "rgba(252, 181, 33, 0.15)"
      : "transparent",
    color: state.isSelected ? "white" : "#334155",
    "&:hover": { backgroundColor: "#FCB521", color: "white" },
    fontSize: "12px",
  }),
  placeholder: (base: any) => ({ ...base, color: "#94A3B8" }),
  menu: (base: any) => ({ ...base, zIndex: 50 }),
};
```

---

## 4. Tarjetas Dinámicas de Estados por Categoría / Estatus

Muestran el desglose directo de registros categorizados con sombra flotante pura, sin bordes (`border-0`), e iconos con fondo semitransparente derivado dinámicamente de su color base.

```tsx
<motion.div
  variants={cardVariants}
  whileHover={{ y: -3 }}
  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
  className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 flex items-center justify-between transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] border-0"
>
  <div>
    <span className="text-xs font-bold text-slate-500 block mb-1 truncate max-w-[150px]">
      {status.name}
    </span>
    <span className="text-2xl font-black text-slate-800">{count}</span>
  </div>
  
  {/* Icono con color dinámico pastel */}
  <div
    className="p-3.5 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: `${status.color}15`, color: status.color }}
  >
    <Ticket className="w-5 h-5" />
  </div>
</motion.div>
```

---

## 5. Tarjetas KPI de Rendimiento (`KPICard`)

Las tarjetas de métricas clave (KPIs) presentan información numérica de alto nivel, estados tipificados, tendencias porcentuales e indicadores opcionales de progreso. **No llevan borde general exterior** (`border-0`).

```tsx
<motion.div
  variants={cardVariants}
  whileHover={{ y: -3 }}
  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
  className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
>
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${textColorClass}`}>{value}</span>
        {subtitle && <span className="text-sm text-slate-500">{subtitle}</span>}
      </div>
    </div>
    <div className={`p-3.5 rounded-full ${iconBgClass}`}>
      {icon}
    </div>
  </div>

  {/* Tendencia (Opcional) */}
  {trend && (
    <div className="mt-auto flex items-center gap-2 text-sm">
      <span className={`flex items-center font-medium ${trend.isPositive ? 'text-success' : 'text-danger'}`}>
        {trend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {trend.value}%
      </span>
      <span className="text-slate-500">{trend.label || 'vs mes anterior'}</span>
    </div>
  )}

  {/* Barra de Progreso (Opcional) */}
  {progress !== undefined && (
    <div className="mt-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">Progreso</span>
        <span className={`font-medium ${textColorClass}`}>{progress}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${progressColors[status]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )}
</motion.div>
```

### Variantes de Estado en KPICard (Fondo de Icono y Colores de Texto)
*   **`primary`**: Texto `text-primary`, fondo icono `bg-primary/10`
*   **`success`**: Texto `text-success`, fondo icono `bg-success/10` (`#34AB45`)
*   **`warning`**: Texto `text-attention`, fondo icono `bg-attention/10` (`#FE4A23` / `#F1A604`)
*   **`danger`**: Texto `text-danger`, fondo icono `bg-danger/10` (`#DA1E37`)
*   **`neutral`**: Texto `text-slate-600`, fondo icono `bg-slate-100`

---

## 6. Tarjetas de Contenedor General y Gráficas (`Card`)

Todas las tarjetas que encierran componentes del dashboard, como los **gráficos analíticos** y mini tablas, se encapsulan utilizando el componente base `Card`. Deben ser completamente **sin bordes** (`border-0`).

```tsx
<motion.div
  variants={cardVariants}
  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
  className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0"
>
  {/* Cabecera de Tarjeta opcional */}
  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[32px]">
    <h3 className="font-bold text-slate-800">{title}</h3>
    {action && <div>{action}</div>}
  </div>

  {/* Cuerpo de la Tarjeta (Gráficos / Tablas) */}
  <div className="p-6">
    {children}
  </div>
</motion.div>
```

---

## 7. Gráficos Analíticos (Recharts en Tarjetas sin Borde)

Los gráficos se alojan dentro de componentes `Card` **sin borde exterior** (`border-0`), confiando en el fondo blanco `bg-white`, border radius `rounded-[32px]` y la sombra flotante `shadow-[0_8px_30px_rgba(0,0,0,0.06)]`.

### A. Gráfico de Línea Temporal (Creados vs Cerrados)
Utilizado para mostrar la tendencia histórica en el tiempo.

*   **Líneas**: `type="monotone"`, `strokeWidth={3}`, `dot={{ r: 4 }}`.
*   **Color Creados**: `#FE4A23` (Naranja/Atención).
*   **Color Cerrados**: `#34AB45` (Verde/Éxito).
*   **Rejilla y Ejes**: `CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"`, `tick={{ fill: '#64748B', fontSize: 12 }}`.

### B. Gráfico de Dona / Pie (Distribución de Prioridad)
Utilizado para desglosar porcentajes de un total.

*   **Dimensiones de la Dona**: `innerRadius={60}`, `outerRadius={80}`, `paddingAngle={5}`.
*   **Leyenda Inferior de Colores**: Grid de 2 columnas con círculos de color `w-3 h-3 rounded-full`:
    ```tsx
    <div className="grid grid-cols-2 gap-2 mt-2">
      {priorityData.map((item) => (
        <div key={item.name} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600">{item.name}</span>
          </div>
          <span className="font-medium text-slate-800">{item.value}</span>
        </div>
      ))}
    </div>
    ```

### C. Gráfico de Barras Apiladas por Sede (BarChart Stacked)
Muestra la acumulación de sub-categorías por cada sede o punto operativo.

*   **Acumulativo**: `stackId="a"`.
*   **Border Radius por Posición**:
    *   Fondo de pila (primer elemento): `radius={[0, 0, 4, 4]}`.
    *   Tope de pila (último elemento): `radius={[4, 4, 0, 0]}`.
    *   Elementos intermedios: `radius={[0, 0, 0, 0]}`.

### D. Gráfico de Barras Horizontales / Antigüedad (Aging Vertical BarChart)
Visualiza rangos o tramos de antigüedad (`layout="vertical"`).

*   **Altura de Barra**: `barSize={24}`, `radius={[0, 4, 4, 0]}`.
*   **Colores por Criticidad de Antigüedad**:
    *   `0-24h`: `#94A3B8` (Gris Neutro).
    *   `1-3 días`: `#F1A604` (Amarillo Atención).
    *   `3-7 días`: `#FE4A23` (Naranja Advertencia).
    *   `>7 días`: `#DA1E37` (Rojo Crítico).

---

## 8. Mini Tablas en Dashboard (ej: Tickets Urgentes)

Para presentar listas de datos críticos dentro de una tarjeta del dashboard (la cual tampoco tiene bordes exteriores), se utiliza el patrón pildórico con separación entre filas.

```tsx
<table className="w-full border-separate border-spacing-y-3 text-center text-sm">
  <thead>
    <tr className="text-white text-xs font-bold uppercase tracking-wider">
      <th className="py-2 px-3 bg-primary-gold first:rounded-l-full last:rounded-r-full">Ticket</th>
      <th className="py-2 px-3 bg-primary-gold first:rounded-l-full last:rounded-r-full">Área</th>
      <th className="py-2 px-3 bg-primary-gold first:rounded-l-full last:rounded-r-full">Tiempo</th>
      <th className="py-2 px-3 bg-primary-gold first:rounded-l-full last:rounded-r-full">Límite</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow">
      <td className="py-2 px-3 bg-[#FAFAFA] font-bold text-slate-800 first:rounded-l-full last:rounded-r-full">
        #TK-102
      </td>
      <td className="py-2 px-3 bg-[#FAFAFA] text-slate-600 text-xs first:rounded-l-full last:rounded-r-full">Mantenimiento</td>
      <td className="py-2 px-3 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
        <Badge variant="danger">45 min</Badge>
      </td>
      <td className="py-2 px-3 bg-[#FAFAFA] text-slate-600 font-semibold text-xs first:rounded-l-full last:rounded-r-full">2 horas</td>
    </tr>
  </tbody>
</table>
```

---

## 9. Badges de Estado (`Badge.tsx`)

Pequeñas etiquetas en forma de píldora para estados o niveles de alerta.

*   **Estructura Base**: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`.
*   **Variantes**:
    *   **`success`**: `bg-success/10 text-success border-success/25`
    *   **`warning`**: `bg-attention/10 text-attention border-attention/25`
    *   **`danger`**: `bg-danger/10 text-danger border-danger/25`
    *   **`info`**: `bg-blue-50 text-blue-700 border-blue-200`
    *   **`neutral`**: `bg-slate-100 text-slate-700 border-slate-200`
    *   **`primary`**: `bg-primary/10 text-primary border-primary/25`

---

## 10. Estados de Carga y Error (Loaders / Error Alerts)

### Estado de Carga (Spinner Dorado Central)
```tsx
<div className="flex flex-col items-center justify-center h-96">
  <div className="w-10 h-10 border-4 border-primary-gold/20 border-t-primary-gold rounded-full animate-spin mb-4" />
  <p className="text-sm font-medium text-slate-500">Cargando estadísticas del Dashboard...</p>
</div>
```

### Estado de Error (Tarjeta Rojo Pastel)
```tsx
<div className="p-6 bg-red-50 border border-red-150 rounded-xl text-center text-red-600 max-w-xl mx-auto my-12">
  <AlertOctagon className="w-8 h-8 mx-auto mb-2 text-red-500" />
  <h3 className="font-semibold text-base mb-1">Error al cargar estadísticas</h3>
  <p className="text-xs text-red-500">{error || 'No se pudieron recuperar los datos.'}</p>
</div>
```

---

## 11. Resumen de Tokens de Diseño para Dashboards

| Elemento | Clases de Tailwind / Valor | Descripción |
| :--- | :--- | :--- |
| **Bordes de Tarjetas** | `border-0` (Sin borde exterior) | **Estándar Obligatorio**: Ninguna tarjeta (KPI, gráficas, filtros, estatus) lleva borde. |
| **Color Dorado Primario** | `bg-primary-gold` (`#FCB521`) | Encabezados de mini tablas, cabecera de filtros colapsable, spinner de carga, icono principal. |
| **Color Éxito / SLA** | `#34AB45` (`bg-success`) | KPI cerrado, SLA cumplido, líneas de cierre. |
| **Color Advertencia** | `#FE4A23` / `#F1A604` (`bg-attention`) | Tickets urgentes, SLA medio, antigüedad 1-7 días. |
| **Color Peligro / Crítico** | `#DA1E37` (`bg-danger`) | SLA bajo, antigüedad >7 días, badges de criticidad alta. |
| **Radius de Tarjetas** | `rounded-[32px]` | Esquinas curvadas insignia para tarjetas KPI, gráficas y contenedores generales. |
| **Sombra de Tarjetas** | `shadow-[0_8px_30px_rgba(0,0,0,0.06)]` | Sombra suave flotante que reemplaza los bordes. |
| **Radius de Filtros/Selects**| `rounded-full` | Estilo píldora para selects, campos de fecha y botones de acción de búsqueda. |
