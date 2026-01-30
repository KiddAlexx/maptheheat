/* eslint-disable react-refresh/only-export-components */

// React imports
import { createContext, ReactNode, useContext, useReducer } from 'react';

// Hooks
import { useMediaQuery } from 'usehooks-ts';

// Types
type View = 'list' | 'venue' | 'map';

interface State {
  currentView: View;
}

interface UIContextType extends State {
  is2xlScreen: boolean;
  isXlScreen: boolean;
  isLargeScreen: boolean;
  isMediumScreen: boolean;
  isXSmallScreen: boolean;
  isSmallScreen: boolean;
  updateView: (view: View) => void;
}

interface UIProviderProps {
  children: ReactNode;
}

type Action = { type: 'update-view'; payload: { currentView: View } };

const UIContext = createContext<UIContextType | undefined>(undefined);

const initialState: State = {
  currentView: 'list',
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'update-view': {
      return {
        ...state,
        currentView: action.payload.currentView,
      };
    }
    default:
      return state;
  }
}

function UIProvider({ children }: UIProviderProps) {
  const [{ currentView }, dispatch] = useReducer(reducer, initialState);

  function updateView(view: View) {
    dispatch({ type: 'update-view', payload: { currentView: view } });
  }

  const is2xlScreen = useMediaQuery('(min-width: 1536px)');
  const isXlScreen = useMediaQuery('(min-width: 1280px)');
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isMediumScreen = useMediaQuery('(min-width: 768px)');
  const isSmallScreen = useMediaQuery('(min-width: 640px)');
  const isXSmallScreen = useMediaQuery('(min-width: 480px)');

  return (
    <UIContext.Provider
      value={{
        is2xlScreen,
        isXlScreen,
        isLargeScreen,
        isMediumScreen,
        isXSmallScreen,
        isSmallScreen,
        currentView,
        updateView,
      }}
    >
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
