import { useParams } from 'react-router';

function ReviewForm() {
  const { venueId } = useParams();
  return <div>Reviews {venueId}</div>;
}

export default ReviewForm;
