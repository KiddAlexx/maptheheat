import { Pagination } from '@nextui-org/react';

function ReviewPagination({ pagination, updatePageNumber, totalCount }) {
  const { pageNumber, maxResults } = pagination;
  const pageCount = totalCount ? Math.ceil(totalCount / maxResults) : 0;

  if (pageCount <= 1) {
    return null;
  }

  return (
    <Pagination
      showControls
      total={pageCount}
      initialPage={1}
      page={pageNumber}
      onChange={updatePageNumber}
    />
  );
}

export default ReviewPagination;
