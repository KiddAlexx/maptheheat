import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useRestaurants } from '../context/RestaurantContext';
import styles from './MapView.module.css';
import { useEffect } from 'react';
import L from 'leaflet';
import chilliPin from '../assets/chillipin.png';
import MapPopupContent from './MapPopupContent';

function MapView() {
  const {
    restaurants,
    isLoading,
    errorMessage,
    setActiveRestaurant,
    activeRestaurant,
  } = useRestaurants();

  const lat = activeRestaurant?.coords?.lat || 41.3874;
  const lon = activeRestaurant?.coords?.lon || 2.17;

  function ChangeCenter({ lat, lon }) {
    const map = useMap();

    useEffect(() => {
      map.setView([lat, lon], 13.5);
    }, [lat, lon, map]);

    return null;
  }

  const createCustomIcon = (color) => {
    return new L.Icon({
      iconUrl: chilliPin,
      iconSize: [23, 66],
      iconAnchor: [0, 66],
      popupAnchor: [11, -47],
    });
  };

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
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.coords.lat, restaurant.coords.lon]}
            icon={createCustomIcon('red')}
          >
            <Popup>
              <MapPopupContent restaurant={restaurant} />
            </Popup>
          </Marker>
        ))}
        <ChangeCenter lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}

export default MapView;
