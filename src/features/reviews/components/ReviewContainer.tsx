import ReviewListView from './ReviewListView';
import ReviewPagination from './ReviewPagination';
import ReviewSort from './ReviewSort';

function ReviewContainer() {
  return (
    <>
      <ReviewSort />
      <ReviewPagination />
      <ReviewListView />
      <ReviewPagination />
    </>
  );
}

export default ReviewContainer;
