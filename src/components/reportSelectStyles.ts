// components/reportSelectStyles.ts
// Estilos compartidos para react-select en los filtros de reportes: control tipo
// píldora slate-100, focus dorado y opciones con acento dorado.

export const reportSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "#F1F5F9", // slate-100
    border: "0",
    borderRadius: "9999px",
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    fontSize: "13px",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(252, 181, 33, 0.4)" : "none",
    "&:hover": { borderColor: "transparent" },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#FCB521"
      : state.isFocused
      ? "rgba(252, 181, 33, 0.1)"
      : "white",
    color: state.isSelected ? "white" : "#1E293B",
    fontSize: "13px",
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 20,
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #F1F5F9",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  }),
  menuList: (provided: any) => ({ ...provided, maxHeight: "220px", paddingTop: 4, paddingBottom: 4 }),
  // El menú se saca a <body>: las tarjetas de reporte usan overflow-hidden y
  // recortarían el desplegable.
  menuPortal: (provided: any) => ({ ...provided, zIndex: 9999 }),
};
