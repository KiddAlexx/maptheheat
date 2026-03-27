// Third Party Imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// React imports
import { useEffect, useMemo } from 'react';

// Hooks
import { useVenueFilterContext } from '@/context/VenueFilterContext';
import { useVenues } from '../venues/hooks/useVenues';
import { useSearchParams } from 'react-router-dom';

// Assets
import chilliPin from '@/assets/chillipin.webp';

// Components
import MapPopupContent from './MapPopupContent';
import LoaderSpinner from '@/ui/LoaderSpinner';

// Type imports
import type { Coords } from '@/types/venueTypes';

// Style imports
import styles from './MapView.module.css';

function MapView() {
  const [searchParams] = useSearchParams();
  const { filters } = useVenueFilterContext();
  // Load venues from supabase
  const { venues, isPending: isLoadingVenues } = useVenues({ filters });

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

  const customIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: chilliPin,
        iconSize: [23, 66],
        iconAnchor: [0, 66],
        popupAnchor: [11, -47],
      }),
    []
  );

  // Render the map with markers for each venue and center it based on the active venue or default coordinates.
  return (
    <div className={styles.mapContainer} aria-label="Venue map">
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
        {isLoadingVenues ? (
          <LoaderSpinner message="Loading venues on map" />
        ) : (
          venues?.map((venue) => (
            <Marker
              key={venue.venueId}
              position={[Number(venue.coords.lat), Number(venue.coords.lon)]}
              icon={customIcon}
            >
              <Popup>
                <MapPopupContent venue={venue} />
              </Popup>
            </Marker>
          ))
        )}
        <InvalidateOnResize />
        <ChangeCenter lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}

export default MapView;
