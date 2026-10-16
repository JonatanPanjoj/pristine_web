// src/pages/sedeCRUD/views/SedeView.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";
import { Sede } from "../../../models/Sede";
import useCreateSede from "../hooks/useCreateSede";
import { useEditSede } from "../hooks/useEditSede";
import SedeFormPanel, { SedeDraft } from "../components/SedeFormPanel";
import SedeMapPanel from "../components/SedeMapPanel";
import SedeTablePanel from "../components/SedeTablePanel";
import { ExitoCard } from "../../../components/ExitoCard";
import { FiMapPin, FiUploadCloud } from "react-icons/fi";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const emptyDraft: SedeDraft = {
  sede_id: "",
  name: "",
  department: "",
  municipality: "",
  address: "",
  zone: "",
  latitude: "",
  length: "",
  sector: [],
  url_photo: null,
  is_enabled: true,
};

const SedeView: React.FC = () => {
  const { addNewSede, loading: creating } = useCreateSede();
  const { editSede, loading: editing } = useEditSede();

  const [draft, setDraft] = useState<SedeDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number } | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  // ExitoCard
  const [showExito, setShowExito] = useState(false);
  const [exitoSuccess, setExitoSuccess] = useState(true);
  const [exitoMessage, setExitoMessage] = useState("");

  const notify = (ok: boolean, msg: string) => {
    setExitoSuccess(ok);
    setExitoMessage(msg);
    setShowExito(true);
  };

  const setField = <K extends keyof SedeDraft>(field: K, value: SedeDraft[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditingId(null);
  };

  // ── Mapa → formulario ──
  const handleMapConfirm = (
    lat: number,
    lng: number,
    zone: string,
    municipality: string,
    department: string,
    address: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      latitude: lat.toString(),
      length: lng.toString(),
      zone: zone || prev.zone,
      municipality: municipality || prev.municipality,
      department: department || prev.department,
      address: address || prev.address,
    }));
  };

  // ── Tabla → formulario ──
  const handleEdit = (sede: Sede) => {
    setDraft({
      id: sede.id,
      sede_id: sede.sede_id ?? "",
      name: sede.name ?? "",
      department: sede.department ?? "",
      municipality: sede.municipality ?? "",
      address: sede.address ?? "",
      zone: sede.zone ?? "",
      latitude: sede.latitude ?? "",
      length: sede.length ?? "",
      sector: sede.sector ?? [],
      url_photo: sede.url_photo ?? null,
      is_enabled: sede.is_enabled ?? true,
    });
    setEditingId(sede.id);
    if (sede.latitude && sede.length) {
      setMapFocus({ lat: parseFloat(sede.latitude), lng: parseFloat(sede.length) });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = (sede: Sede) => {
    if (sede.latitude && sede.length) {
      setMapFocus({ lat: parseFloat(sede.latitude), lng: parseFloat(sede.length) });
    }
  };

  // ── Guardar ──
  const handleSave = async () => {
    const required: (keyof SedeDraft)[] = [
      "name",
      "zone",
      "address",
      "department",
      "municipality",
      "latitude",
      "length",
    ];
    for (const f of required) {
      if (!String(draft[f] ?? "").trim()) {
        notify(false, "Completa todos los campos obligatorios y coloca el pin en el mapa.");
        return;
      }
    }

    const sedeData: Omit<Sede, "id"> = {
      sede_id: draft.sede_id,
      name: draft.name,
      department: draft.department,
      municipality: draft.municipality,
      address: draft.address,
      zone: draft.zone,
      latitude: draft.latitude,
      length: draft.length,
      sector: draft.sector,
      url_photo: draft.url_photo,
      is_enabled: draft.is_enabled,
      updatedAt: Timestamp.now(),
    };

    const res = editingId
      ? await editSede({ ...(sedeData as Sede), id: editingId })
      : await addNewSede(sedeData);

    notify(res.success, res.message);
    if (res.success) {
      resetForm();
      setRefreshSignal((s) => s + 1);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-108px)]"
    >
      {/* Encabezado Superior (Header Card) */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                <FiMapPin className="w-6 h-6" />
              </div>
              Gestor de Sedes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Registra y administra las sedes geográficas y ubicaciones de tu organización.
            </p>
          </div>

          <button
            onClick={() => notify(true, "Carga masiva: función disponible próximamente.")}
            className="flex items-center justify-center px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 flex-shrink-0"
          >
            <FiUploadCloud className="w-4 h-4 mr-2 stroke-[2.5]" />
            Carga Masiva
          </button>
        </div>
      </motion.div>

      {/* Layout: formulario | (mapa + tabla) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        {/* Izquierda: formulario */}
        <motion.div variants={cardVariants} className="lg:col-span-5">
          <SedeFormPanel
            draft={draft}
            setField={setField}
            onSubmit={handleSave}
            onClear={resetForm}
            saving={creating || editing}
            isEdit={!!editingId}
          />
        </motion.div>

        {/* Derecha: mapa + tabla */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div variants={cardVariants}>
            <SedeMapPanel focus={mapFocus} onConfirm={handleMapConfirm} />
          </motion.div>
          <motion.div variants={cardVariants}>
            <SedeTablePanel
              onEdit={handleEdit}
              onView={handleView}
              refreshSignal={refreshSignal}
            />
          </motion.div>
        </div>
      </div>

      {showExito && (
        <ExitoCard
          onClose={() => setShowExito(false)}
          loading={creating || editing}
          success={exitoSuccess}
          message={exitoMessage}
        />
      )}
    </motion.div>
  );
};

export default SedeView;
