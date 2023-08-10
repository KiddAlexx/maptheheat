import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';

function DetailedVenueView() {
  const { city, venue } = useParams();

  return (
    <div>
      <p>{venue}</p>
      <p>{city}</p>
      <Link to="/app/map" className="btn-default">
        Back to Map
      </Link>
    </div>
  );
}

export default DetailedVenueView;
