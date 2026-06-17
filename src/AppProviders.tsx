// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // temporarily disabled for GIF recording
import { GlobalErrorProvider } from './context/ErrorContext';
import { HeroUIProvider } from '@heroui/system';
import { ThemeProvider } from 'next-themes';
import { VenueFilterProvider } from './context/VenueFilterContext';
import { ReviewSortProvider } from './context/ReviewSortContext';
import { UserReviewsProvider } from './context/UserReviewsContext';
import { UserFavVenuesProvider } from './context/UserFavVenuesContext';
import { ModalProvider } from './context/ModalContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { UIProvider } from './context/UIContext';

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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <HeroUIProvider navigate={navigate}>
      <GlobalErrorProvider>
        <VenueFilterProvider>
          <UserFavVenuesProvider>
            <ReviewSortProvider>
              <UserReviewsProvider>
                <ModalProvider>
                  <UIProvider>
                    <QueryClientProvider client={queryClient}>
                      {/* <ReactQueryDevtools initialIsOpen={false} /> temporarily disabled for GIF recording */}
                      {children}
                    </QueryClientProvider>
                  </UIProvider>
                </ModalProvider>
              </UserReviewsProvider>
            </ReviewSortProvider>
          </UserFavVenuesProvider>
        </VenueFilterProvider>
      </GlobalErrorProvider>
    </HeroUIProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
