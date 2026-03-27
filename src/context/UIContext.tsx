/* eslint-disable react-refresh/only-export-components */

// React imports
import { createContext, ReactNode, useContext, useMemo } from 'react';

// Hooks
import { useMediaQuery } from 'usehooks-ts';

interface UIContextType {
  is2xlScreen: boolean;
  isXlScreen: boolean;
  isLargeScreen: boolean;
  isMediumScreen: boolean;
  isXSmallScreen: boolean;
  isSmallScreen: boolean;
}

interface UIProviderProps {
  children: ReactNode;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

function UIProvider({ children }: UIProviderProps) {
  const is2xlScreen = useMediaQuery('(min-width: 1536px)');
  const isXlScreen = useMediaQuery('(min-width: 1280px)');
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isMediumScreen = useMediaQuery('(min-width: 768px)');
  const isSmallScreen = useMediaQuery('(min-width: 640px)');
  const isXSmallScreen = useMediaQuery('(min-width: 480px)');

  const value = useMemo(
    () => ({
      is2xlScreen,
      isXlScreen,
      isLargeScreen,
      isMediumScreen,
      isXSmallScreen,
      isSmallScreen,
    }),
    [
      is2xlScreen,
      isXlScreen,
      isLargeScreen,
      isMediumScreen,
      isXSmallScreen,
      isSmallScreen,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// A custom hook to provide easy access to the UIContext
function useUIContext() {
  const context = useContext(UIContext);
  if (context === undefined)
    throw new Error('UI context was used outside the UIProvider');
  return context;
}

export { UIProvider, useUIContext };
