/* eslint-disable react-refresh/only-export-components */

import { createContext, ReactNode, useContext, useReducer } from 'react';
import { useMediaQuery } from 'usehooks-ts';

type View = 'list' | 'venue' | 'map';

interface State {
  currentView: View;
}

interface UIContextType extends State {
  isLargeScreen: boolean;
  isXSmallScreen: boolean;
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

  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isXSmallScreen = useMediaQuery('(min-width: 480px)');

  return (
    <UIContext.Provider
      value={{ isLargeScreen, isXSmallScreen, currentView, updateView }}
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
