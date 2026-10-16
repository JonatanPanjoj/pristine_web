// src/pages/AutomaticReports/components/UserSearchSelect.tsx
import React, { useState } from "react";
import Select from "react-select";
import { useUserSearch } from "../hooks/useUserSearch";
import { reportSelectStyles } from "../../../components/reportSelectStyles";

export interface UserOption {
  value: string;   // ID Firestore del usuario
  label: string;   // Nombre visible
  email: string;   // Correo asociado, se autocompleta en el formulario
}

interface UserSearchSelectProps {
  value: UserOption | null;
  onChange: (option: UserOption | null) => void;
  isDisabled?: boolean;
}

// Selector de usuario con búsqueda contra Firestore (tokens `search_keywords`).
const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  value,
  onChange,
  isDisabled = false,
}) => {
  const [term, setTerm] = useState("");
  const { users, loading } = useUserSearch(term);

  const options: UserOption[] = users.map((u) => ({
    value: u.id,
    label: u.name || u.user,
    email: u.email ?? "",
  }));

  return (
    <Select<UserOption>
      value={value}
      onChange={(option) => onChange(option)}
      onInputChange={(input) => setTerm(input)}
      options={options}
      isLoading={loading}
      isDisabled={isDisabled}
      isClearable
      filterOption={null}
      placeholder="Buscar usuario por nombre…"
      noOptionsMessage={() => (loading ? "Buscando…" : "Sin coincidencias")}
      loadingMessage={() => "Buscando…"}
      styles={reportSelectStyles}
    />
  ); // cierra return
}; // cierra const UserSearchSelect

export default UserSearchSelect;
