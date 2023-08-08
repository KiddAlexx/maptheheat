import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useRestaurants } from '../context/RestaurantContext';
import styles from './MapView.module.css';
import { useEffect } from 'react';

function MapView() {
  const {
    restaurants,
    isLoading,
    errorMessage,
    setActiveRestaurant,
    activeRestaurant,
  } = useRestaurants();

  const lat = activeRestaurant.coords.lat || 41.3874;
  const lon = activeRestaurant.coords.lon || 2.17;

  function ChangeCenter({ lat, lon }) {
    const map = useMap();

    useEffect(() => {
      map.setView([lat, lon]);
    }, [lat, lon, map]);

    return null;
  }

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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.coords.lat, restaurant.coords.lon]}
          >
            <Popup>
              {restaurant.name} <br /> {restaurant.description}
            </Popup>
          </Marker>
        ))}
        <ChangeCenter lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}

export default MapView;
