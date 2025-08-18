import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalErrorProvider } from './context/ErrorContext';
import { HeroUIProvider } from '@heroui/system';
import { VenueFilterProvider } from './context/VenueFilterContext';
import { ReviewSortProvider } from './context/ReviewSortContext';
import { UserReviewsProvider } from './context/UserReviewsContext';
import { UserFavVenuesProvider } from './context/UserFavVenuesContext';
import { ModalProvider } from './context/ModalContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

interface AppProviderProps {
  children: ReactNode;
}

function AppProviders({ children }: AppProviderProps) {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate}>
      <GlobalErrorProvider>
        <VenueFilterProvider>
          <UserFavVenuesProvider>
            <ReviewSortProvider>
              <UserReviewsProvider>
                <ModalProvider>
                  <QueryClientProvider client={queryClient}>
                    <ReactQueryDevtools initialIsOpen={false} />
                    {children}
                  </QueryClientProvider>
                </ModalProvider>
              </UserReviewsProvider>
            </ReviewSortProvider>
          </UserFavVenuesProvider>
        </VenueFilterProvider>
      </GlobalErrorProvider>
    </HeroUIProvider>
  );
}

export default AppProviders;
