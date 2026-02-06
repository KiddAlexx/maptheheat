import { GlobalErrorProvider } from '@/context/ErrorContext';
import { ReviewSortProvider } from '@/context/ReviewSortContext';
import { UIProvider } from '@/context/UIContext';
import { UserFavVenuesProvider } from '@/context/UserFavVenuesContext';
import { UserReviewsProvider } from '@/context/UserReviewsContext';
import { VenueFilterProvider } from '@/context/VenueFilterContext';
import { ModalProvider } from '@/context/ModalContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const AllProviders = ({ children }: PropsWithChildren) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <GlobalErrorProvider>
      <VenueFilterProvider>
        <UserFavVenuesProvider>
          <ReviewSortProvider>
            <UserReviewsProvider>
              <ModalProvider>
                <UIProvider>
                  <QueryClientProvider client={client}>
                    {children}
                  </QueryClientProvider>
                </UIProvider>
              </ModalProvider>
            </UserReviewsProvider>
          </ReviewSortProvider>
        </UserFavVenuesProvider>
      </VenueFilterProvider>
    </GlobalErrorProvider>
  );
};

export default AllProviders;
