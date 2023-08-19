import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';
import ImageUpload from './ImageUploader';
import VenueRating from './VenueRating';

function DetailedVenueView() {
  const { city, venue } = useParams();

  const { activeRestaurant } = useRestaurants();

  const {
    name,
    phoneNumber,
    detailedAddress,
    website,
    description,
    hours,
    averageRating,
  } = activeRestaurant;

  return (
    <div>
      <h2>{name}</h2>
      <p>{hours}</p>
      <VenueRating initialRating={averageRating} readonly />
      <p>{phoneNumber}</p>
      <p>{detailedAddress}</p>
      <p>{website}</p>
      <p>{description}</p>
      <Link to="/app/map" className="btn-default">
        Back to Map
      </Link>
      <ImageUpload />
    </div>
  );
}

export default DetailedVenueView;
