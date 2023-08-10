import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';
import styles from './MapView.module.css';
import { useEffect } from 'react';
import L from 'leaflet';

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
      map.setView([lat, lon]);
    }, [lat, lon, map]);

    return null;
  }

  const createCustomIcon = (color) => {
    return new L.Icon({
      iconUrl: `data:image/svg+xml;utf-8,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M8.625 0c.61 7.189-5.625 9.664-5.625 15.996 0 4.301 3.069 7.972 9 8.004 5.931.032 9-4.414 9-8.956 0-4.141-2.062-8.046-5.952-10.474.924 2.607-.306 4.988-1.501 5.808.07-3.337-1.125-8.289-4.922-10.378zm4.711 13c3.755 3.989 1.449 9-1.567 9-1.835 0-2.779-1.265-2.769-2.577.019-2.433 2.737-2.435 4.336-6.423z" fill="${color}"/></svg>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.coords.lat, restaurant.coords.lon]}
            icon={createCustomIcon('red')}
          >
            <Popup>
              <div className={styles.tempImageContainer}></div>
              <Link to={`/app/venue/${restaurant.city}/${restaurant.urlSlug}`}>
                <h2
                  onClick={() => {
                    setActiveRestaurant(restaurant);
                  }}
                >
                  {restaurant.name}
                </h2>
              </Link>
            </Popup>
          </Marker>
        ))}
        <ChangeCenter lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}

export default MapView;
