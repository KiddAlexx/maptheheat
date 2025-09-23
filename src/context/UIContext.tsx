/* eslint-disable react-refresh/only-export-components */

import { createContext, ReactNode, useContext } from 'react';
import { useMediaQuery } from 'usehooks-ts';

interface UIContextType {
  isLargeScreen: boolean;
}

interface UIProviderProps {
  children: ReactNode;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

function UIProvider({ children }: UIProviderProps) {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  return (
    <UIContext.Provider value={{ isLargeScreen }}>
      {children}
    </UIContext.Provider>
  );
}

// A custom hook to provide easy access to the UIContext
function useUIContext() {
  const context = useContext(UIContext);
  if (context === undefined)
    throw new Error('UI context was used outside the UIProvider');
  return context;
}

export { UIProvider, useUIContext };
