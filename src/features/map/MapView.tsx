// React imports
import { useEffect } from 'react';

// Third party imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import chilliPin from '../../assets/chillipin.png';
import MapPopupContent from './MapPopupContent';

// Style imports
import styles from './MapView.module.css';

// Type imports
import { Coords } from '../../models/venueTypes';

// Hooks imports
import { useVenues } from '../venues/hooks/useVenues';
import { useSearchParams } from 'react-router-dom';

function MapView() {
  const [searchParams] = useSearchParams();

  // Load venues from supabase
  const { venues } = useVenues();

  // Sets coordinates based on searchParams if available
  // Used to center map on selected venue
  const lat = Number(searchParams.get('lat')) || 41.3874;
  const lon = Number(searchParams.get('lon')) || 2.17;

  function ChangeCenter({ lat, lon }: Coords) {
    const map = useMap();

    useEffect(() => {
      map.setView([Number(lat), Number(lon)], 13.5);
    }, [lat, lon, map]);

    return null;
  }

  const createCustomIcon = () => {
    return new L.Icon({
      iconUrl: chilliPin,
      iconSize: [23, 66],
      iconAnchor: [0, 66],
      popupAnchor: [11, -47],
    });
  };

  // Render the map with markers for each venue and center it based on the active venue or default coordinates.
  return (
    <div className={styles.mapContainer}>
      <MapContainer
        className={styles.map}
        center={[lat, lon]}
        zoom={13.5}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        {venues?.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.coords.lat, venue.coords.lon]}
            icon={createCustomIcon()}
          >
            <Popup>
              <MapPopupContent venue={venue} />
            </Popup>
          </Marker>
        ))}
        <ChangeCenter lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}

export default MapView;
