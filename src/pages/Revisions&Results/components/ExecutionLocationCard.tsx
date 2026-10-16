// components/ExecutionLocationCard.tsx
// Dónde se ejecutó la revisión: las coordenadas y un mapa de solo lectura. El
// mapa no se puede arrastrar ni hacer zoom —es una referencia dentro de la
// ficha, no un mapa para explorar—, así que el scroll de la página nunca se
// queda atrapado dentro de él.

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { HiOutlineLocationMarker, HiOutlineExternalLink, HiOutlineClock } from 'react-icons/hi';
import { ExecutionCoordinates } from '../utils/executionCoordinates';
import { AuditoriaLocation } from '../../../models/auditoria';
import { formatAuditoriaDateTime } from '../../../utils/formatDateTime';
import 'leaflet/dist/leaflet.css';

const MAP_ZOOM = 16;
const COORDINATE_DECIMALS = 6;

const START_MARKER_STYLE = { color: '#FFFFFF', weight: 3, fillColor: '#10B981', fillOpacity: 1 };
const END_MARKER_STYLE = { color: '#FFFFFF', weight: 3, fillColor: '#FCB521', fillOpacity: 1 };

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap';

interface ExecutionLocationCardProps {
  coordinates?: ExecutionCoordinates;
  startLocation?: AuditoriaLocation;
  endLocation?: AuditoriaLocation;
  /** Nombre del sitio, para rotular el punto sin repetir la cabecera. */
  placeName: string;
}

export const ExecutionLocationCard: React.FC<ExecutionLocationCardProps> = ({
  coordinates,
  startLocation,
  endLocation,
  placeName,
}) => {
  // Determinar punto principal de enfoque del mapa
  const primaryLoc = endLocation || startLocation || coordinates;
  if (!primaryLoc) return null;

  const center: [number, number] = [primaryLoc.latitude, primaryLoc.longitude];

  const hasBothLocations = Boolean(startLocation && endLocation);

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
          <HiOutlineLocationMarker className="w-5 h-5 text-primary-gold" />
          Ubicación de la ejecución en campo
        </h3>
        <p className="text-xs text-slate-400">{placeName}</p>
      </div>

      {/* Tarjetas de coordenadas de inicio y fin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {startLocation && (
          <LocationDetailsBlock
            title="Apertura de Auditoría (Inicio)"
            badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            dotColor="bg-emerald-500"
            location={startLocation}
          />
        )}

        {endLocation && (
          <LocationDetailsBlock
            title="Cierre de Auditoría (Fin)"
            badgeColor="bg-amber-50 text-amber-700 border-amber-200"
            dotColor="bg-amber-500"
            location={endLocation}
          />
        )}

        {!startLocation && !endLocation && coordinates && (
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CoordinateField label="Latitud" value={coordinates.latitude} />
            <CoordinateField label="Longitud" value={coordinates.longitude} />
          </div>
        )}
      </div>

      {/* Mapa interactivo Leaflet */}
      <div className="h-64 rounded-2xl overflow-hidden border border-slate-100 relative">
        <MapContainer
          center={center}
          zoom={MAP_ZOOM}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

          {startLocation && (
            <CircleMarker
              center={[startLocation.latitude, startLocation.longitude]}
              radius={10}
              pathOptions={START_MARKER_STYLE}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span className="text-[10px] font-bold text-slate-700">Inicio</span>
              </Tooltip>
            </CircleMarker>
          )}

          {endLocation && (
            <CircleMarker
              center={[endLocation.latitude, endLocation.longitude]}
              radius={10}
              pathOptions={END_MARKER_STYLE}
            >
              <Tooltip permanent direction="bottom" offset={[0, 10]}>
                <span className="text-[10px] font-bold text-slate-700">Fin</span>
              </Tooltip>
            </CircleMarker>
          )}

          {!startLocation && !endLocation && coordinates && (
            <CircleMarker center={center} radius={9} pathOptions={END_MARKER_STYLE} />
          )}
        </MapContainer>
      </div>

      {/* Enlaces externos a Google Maps */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        {startLocation && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${startLocation.latitude},${startLocation.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:opacity-80 transition-opacity"
          >
            <HiOutlineExternalLink className="w-4 h-4" />
            Google Maps (Ubicación Inicio)
          </a>
        )}

        {endLocation && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${endLocation.latitude},${endLocation.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-gold hover:opacity-80 transition-opacity"
          >
            <HiOutlineExternalLink className="w-4 h-4" />
            Google Maps (Ubicación Fin)
          </a>
        )}

        {!startLocation && !endLocation && coordinates && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-gold hover:opacity-80 transition-opacity"
          >
            <HiOutlineExternalLink className="w-4 h-4" />
            Abrir en Google Maps
          </a>
        )}
      </div>
    </div>
  );
};

const LocationDetailsBlock: React.FC<{
  title: string;
  badgeColor: string;
  dotColor: string;
  location: AuditoriaLocation;
}> = ({ title, badgeColor, dotColor, location }) => (
  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3">
    <div className="flex items-center justify-between gap-2">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${badgeColor}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        {title}
      </span>
      {location.timestamp && (
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          <HiOutlineClock className="w-3.5 h-3.5" />
          {formatAuditoriaDateTime(location.timestamp)}
        </span>
      )}
    </div>

    <div className="grid grid-cols-3 gap-2">
      <CoordinateField label="Latitud" value={location.latitude} />
      <CoordinateField label="Longitud" value={location.longitude} />
      <AltitudeField value={location.altitude} />
    </div>
  </div>
);

const CoordinateField: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <span className="text-[11px] font-semibold text-slate-400">{label}</span>
    <div className="bg-white rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 font-mono mt-0.5 border border-slate-100 truncate">
      {value.toFixed(COORDINATE_DECIMALS)}
    </div>
  </div>
);

const AltitudeField: React.FC<{ value: number }> = ({ value }) => (
  <div>
    <span className="text-[11px] font-semibold text-slate-400">Altitud</span>
    <div className="bg-white rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 font-mono mt-0.5 border border-slate-100 truncate">
      {value ? `${value.toFixed(1)} m` : 'N/D'}
    </div>
  </div>
);

export default ExecutionLocationCard;
