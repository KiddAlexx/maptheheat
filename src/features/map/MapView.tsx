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
import { Coords } from '../../types/venueTypes';

// Hooks imports
import { useVenues } from '../venues/hooks/useVenues';
import { useSearchParams } from 'react-router-dom';
import { useVenueFilterContext } from '@/context/VenueFilterContext';
import LoaderSpinner from '@/ui/LoaderSpinner';

function MapView() {
  const [searchParams] = useSearchParams();
  const { filters } = useVenueFilterContext();
  // Load venues from supabase
  const { venues, isLoading: isLoadingVenues } = useVenues({ filters });

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

  function InvalidateOnResize() {
    const map = useMap();

    useEffect(() => {
      const container = map.getContainer();

      // Recalculate container size on change / useful toggling view
      const observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(container);

      // One extra pass after mount in case first paint was hidden
      requestAnimationFrame(() => map.invalidateSize());

      return () => observer.disconnect();
    }, [map]);

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
        {venues?.map((venue) =>
          isLoadingVenues ? (
            <LoaderSpinner />
          ) : (
            <Marker
              key={venue.venueId}
              position={[Number(venue.coords.lat), Number(venue.coords.lon)]}
              icon={createCustomIcon()}
            >
              <Popup>
                <MapPopupContent venue={venue} />
              </Popup>
            </Marker>
          )
        )}
        <InvalidateOnResize />
        <ChangeCenter lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}

export default MapView;
