// src/pages/sedeCRUD/components/SedeMapPanel.tsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FiMapPin, FiCheck, FiX, FiSearch } from "react-icons/fi";

// Iconos de Leaflet
const defaultIcon = L.icon({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface GeoResult {
  zone: string;
  municipality: string;
  department: string;
  address: string;
}

interface SedeMapPanelProps {
  focus?: { lat: number; lng: number } | null;
  onConfirm: (
    lat: number,
    lng: number,
    zone: string,
    municipality: string,
    department: string,
    address: string
  ) => void;
}

const GT_CENTER = { lat: 14.62212239740069, lng: -90.51117979773362 };

// Recentra el mapa cuando cambia `center`
const Recenter: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
};

const SedeMapPanel: React.FC<SedeMapPanelProps> = ({ focus, onConfirm }) => {
  const [position, setPosition] = useState(focus ?? GT_CENTER);
  const [center, setCenter] = useState(focus ?? GT_CENTER);
  const [geo, setGeo] = useState<GeoResult>({
    zone: "",
    municipality: "",
    department: "",
    address: "",
  });
  const [searchText, setSearchText] = useState("");

  // Reverse geocode (Nominatim)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      const a = data.address || {};
      const formatted = `${a.road || ""} ${a.house_number || ""}, ${a.suburb || ""}, ${
        a.city || a.town || a.village || ""
      }, ${a.state || ""}, ${a.postcode || ""}, ${a.country || ""}`;
      setGeo({
        zone: a.suburb || a.district || "",
        municipality: a.city || a.town || a.village || "",
        department: (a.state || "").replace(/Department|Departamento/gi, "").trim(),
        address: formatted.trim().replace(/,+/g, ",").replace(/ ,/g, ""),
      });
    } catch (e) {
      console.error("Error reverse geocoding:", e);
    }
  };

  // Forward geocode (búsqueda)
  const handleSearch = async () => {
    const term = searchText.trim();
    if (!term) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          term
        )}&limit=1`
      );
      const data = await res.json();
      if (data?.[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition({ lat, lng });
        setCenter({ lat, lng });
        fetchAddress(lat, lng);
      }
    } catch (e) {
      console.error("Error en búsqueda:", e);
    }
  };

  useEffect(() => {
    if (focus) {
      setPosition(focus);
      setCenter(focus);
      fetchAddress(focus.lat, focus.lng);
    }
  }, [focus]);

  useEffect(() => {
    fetchAddress(position.lat, position.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return <Marker position={position} />;
  };

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-primary-dark text-white flex items-center justify-center shrink-0 shadow-sm">
          <FiMapPin className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Ubicación en el Mapa</h2>
      </div>

      <div className="relative">
        {/* Buscador flotante en mapa */}
        <div className="absolute top-4 left-4 right-4 z-[400] flex gap-2">
          <div className="relative flex-1 max-w-xs">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Buscar dirección…"
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white/95 border-0 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Mapa */}
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={8}
          style={{ height: "320px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          <Recenter center={center} />
        </MapContainer>
      </div>

      {/* Barra de confirmación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-full bg-amber-50 text-primary-gold flex items-center justify-center shrink-0 border border-amber-200/60">
            <FiMapPin className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800">Pin Colocado</p>
            <p className="text-xs font-normal text-slate-500 truncate">
              {geo.zone ? `${geo.zone} · ` : ""}
              {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setPosition(focus ?? GT_CENTER);
              setCenter(focus ?? GT_CENTER);
            }}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-95"
          >
            <FiX className="w-3.5 h-3.5" />
            Cancelar
          </button>
          <button
            onClick={() =>
              onConfirm(
                position.lat,
                position.lng,
                geo.zone,
                geo.municipality,
                geo.department,
                geo.address
              )
            }
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-primary-dark hover:opacity-90 rounded-full transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] active:scale-95"
          >
            <FiCheck className="w-3.5 h-3.5" />
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SedeMapPanel;
