import { useParams } from 'react-router';

function DetailedVenueView() {
  const { city, venue } = useParams();

  return (
    <div>
      <p>{venue}</p>
      <p>{city}</p>
    </div>
  );
}

export default DetailedVenueView;
