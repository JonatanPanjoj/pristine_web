import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configurar los iconos de Leaflet
const defaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], 
  iconAnchor: [12, 41], 
  popupAnchor: [1, -34],
  shadowSize: [41, 41], 
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapComponentProps {
  initialLat?: number;
  initialLng?: number;
  mode?: 'view' | 'edit';
  onExit?: () => void;
  onSave?: (lat: number, lng: number, zone: string, municipality: string, department: string, address: string) => void; // Ajustado para devolver zona, municipio, departamento y dirección formateada
}

const MapComponent: React.FC<MapComponentProps> = ({ initialLat, initialLng, mode = 'edit', onExit, onSave }) => {
  const [position, setPosition] = useState({ lat: initialLat || 14.62212239740069, lng: initialLng || -90.51117979773362 });
  const [zone, setZone] = useState<string>(''); // Estado para la zona
  const [municipality, setMunicipality] = useState<string>(''); // Estado para el municipio
  const [department, setDepartment] = useState<string>(''); // Estado para el departamento
  const [formattedAddress, setFormattedAddress] = useState<string>(''); // Estado para la dirección completa

  // Obtener la dirección basada en latitud y longitud usando la API de Nominatim
  const fetchAddressDetails = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const address = data.address;

      // Establecemos los campos específicos (ajusta según los campos de Nominatim)
      setZone(address?.suburb || address?.district || ''); // Buscar zona/suburbio o distrito
      setMunicipality(address?.city || address?.town || address?.village || ''); // Buscar ciudad, pueblo o aldea
      setDepartment(address?.state || ''); // Buscar estado/departamento

      // Formatear la dirección de manera elegante
      const formatted = `${address?.road || ''} ${address?.house_number || ''}, ${address?.suburb || ''}, ${address?.city || address?.town || address?.village || ''}, ${address?.state || ''}, ${address?.postcode || ''}, ${address?.country || ''}`;
      setFormattedAddress(formatted.trim().replace(/,+/g, ',').replace(/ ,/g, '')); // Limpiar comas repetidas o espacios
    } catch (error) {
      console.error('Error al obtener los detalles de la dirección:', error);
    }
  };

  useEffect(() => {
    fetchAddressDetails(position.lat, position.lng); // Cargar los detalles al montar o cambiar posición
  }, [position]);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        if (mode === 'edit') {
          setPosition(e.latlng);
          fetchAddressDetails(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return <Marker position={position}></Marker>;
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label>Latitud: {position.lat}</label>
        <br />
        <label>Longitud: {position.lng}</label>
        <br />
        <label>Zona: {zone}</label>
        <br />
        <label>Municipio: {municipality}</label>
        <br />
        <label>Departamento: {department}</label>
        <br />
        <label>Dirección: {formattedAddress}</label> {/* Mostrar la dirección formateada */}
      </div>

      <div className="flex space-x-4 mb-4">
        {mode === 'edit' && (
          <button
            onClick={() => onSave && onSave(position.lat, position.lng, zone, municipality, department, formattedAddress)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors duration-300"
          >
            Guardar
          </button>
        )}
        <button
          onClick={onExit}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full transition-colors duration-300"
        >
          Salir
        </button>
      </div>

      <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
