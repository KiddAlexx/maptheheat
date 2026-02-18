import { GlobalErrorProvider } from '@/context/ErrorContext';
import { ReviewSortProvider } from '@/context/ReviewSortContext';
import { UIProvider } from '@/context/UIContext';
import { UserFavVenuesProvider } from '@/context/UserFavVenuesContext';
import { UserReviewsProvider } from '@/context/UserReviewsContext';
import { VenueFilterProvider } from '@/context/VenueFilterContext';
import { ModalProvider } from '@/context/ModalContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { HeroUIProvider } from '@heroui/system';

import ErrorModal from '@/ui/ErrorModal';
import ModalManager from '@/components/ModalManager';

const AllProviders = ({ children }: PropsWithChildren) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <>
      <HeroUIProvider>
        <GlobalErrorProvider>
          <VenueFilterProvider>
            <UserFavVenuesProvider>
              <ReviewSortProvider>
                <UserReviewsProvider>
                  <ModalProvider>
                    <UIProvider>
                      <QueryClientProvider client={client}>
                        {children}
                        <ErrorModal />
                        <ModalManager />
                      </QueryClientProvider>
                    </UIProvider>
                  </ModalProvider>
                </UserReviewsProvider>
              </ReviewSortProvider>
            </UserFavVenuesProvider>
          </VenueFilterProvider>
        </GlobalErrorProvider>
      </HeroUIProvider>
      <div id="root"></div>
      <div id="modal-root"></div>
    </>
  );
};

export default AllProviders;
