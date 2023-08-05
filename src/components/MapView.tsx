import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useRestaurants } from '../context/RestaurantContext';
import styles from './MapView.module.css';

function MapView() {
  const { restaurants, isLoading, errorMessage } = useRestaurants();
  return (
    <div className={styles.mapContainer}>
      <MapContainer
        className={styles.map}
        center={[41.3874, 2.17]}
        zoom={13.5}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((restaurant) => (
          <Marker position={[restaurant.coords.lat, restaurant.coords.lon]}>
            <Popup>
              {restaurant.name} <br /> {restaurant.description}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
