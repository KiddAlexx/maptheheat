// Third Party Imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// React imports
import { useCallback, useEffect, useMemo, useRef } from 'react';

// Hooks
import { useVenueFilterContext } from '@/context/VenueFilterContext';
import { useVenues } from '../venues/hooks/useVenues';
import { useLocation, useSearchParams } from 'react-router-dom';

// Assets
import chilliPin from '@/assets/chillipin.webp';

// Components
import MapPopupContent from './MapPopupContent';
import LoaderSpinner from '@/ui/LoaderSpinner';

// Type imports
import type { Coords } from '@/types/venueTypes';

// Style imports
import styles from './MapView.module.css';

const TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';

function MapView() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { filters } = useVenueFilterContext();
  // Load venues from supabase
  const { venues, isPending: isLoadingVenues } = useVenues({ filters });
  // Popup opening is a one-shot navigation request; Leaflet owns popup state after this.
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const consumedLocationKey = useRef<string | null>(null);
  const openPopupFor = (
    location.state as { openPopupFor?: string } | null
  )?.openPopupFor;

  // Sets coordinates based on searchParams if available
  // Used to center map on selected venue
  const lat = Number(searchParams.get('lat')) || 41.3874;
  const lon = Number(searchParams.get('lon')) || 2.17;

  function ChangeCenter({ lat, lon }: Coords) {
    const map = useMap();

    useEffect(() => {
      const zoom = 13.5;
      // Shift the center 150px north in pixel space so the pin sits lower in
      // the viewport and the popup card appears roughly centered.
      const pinPx = map.project([Number(lat), Number(lon)], zoom);
      const centeredPx = pinPx.subtract([0, 150]);
      map.flyTo(map.unproject(centeredPx, zoom), zoom);
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

  const openRequestedPopup = useCallback(
    (marker: L.Marker, venueId: string) => {
      if (!openPopupFor || openPopupFor !== venueId) {
        return;
      }

      if (location.key === consumedLocationKey.current) {
        return;
      }

      // Consume before opening so ref callbacks and effects cannot double-open.
      consumedLocationKey.current = location.key;
      requestAnimationFrame(() => marker.openPopup());
    },
    [location.key, openPopupFor]
  );

  useEffect(() => {
    if (!openPopupFor || !venues?.length) {
      return;
    }

    const marker = markerRefs.current[openPopupFor];
    if (!marker) return;

    openRequestedPopup(marker, openPopupFor);
  }, [openPopupFor, openRequestedPopup, venues]);

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
          url={TILE_URL}
        />
        {isLoadingVenues ? (
          <LoaderSpinner message="Loading venues on map" />
        ) : (
          venues?.map((venue) => (
            <Marker
              key={venue.venueId}
              position={[Number(venue.coords.lat), Number(venue.coords.lon)]}
              icon={customIcon}
              ref={(marker: L.Marker | null) => {
                if (marker) {
                  markerRefs.current[venue.venueId] = marker;
                  // Ref callbacks can arrive after the effect, so try opening here too.
                  openRequestedPopup(marker, venue.venueId);
                  return;
                }

                delete markerRefs.current[venue.venueId];
              }}
            >
              <Popup autoPan={false}>
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
