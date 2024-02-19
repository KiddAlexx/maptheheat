/* eslint-disable react-refresh/only-export-components */

// React imports
import { ReactNode, createContext, useContext, useReducer } from 'react';

// Data types
interface State {
  currentUrl: null | string;
  nextUrl: null | string;
}

interface UrlContextType extends State {
  updateUrlValues: (url: State) => void;
  resetUrlValues: () => void;
}

type Action = { type: 'update-url'; payload: State } | { type: 'reset-url' };

interface UrlProviderProps {
  children: ReactNode;
}

const UrlContext = createContext<UrlContextType | undefined>(undefined);

const initialState = {
  currentUrl: null,
  nextUrl: null,
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'update-url':
      return {
        ...state,
        currentUrl: action.payload.currentUrl,
        nextUrl: action.payload.nextUrl,
      };

    case 'reset-url': {
      return {
        ...state,
        currentUrl: null,
        nextUrl: null,
      };
    }

    default:
      return state;
  }
}

function UrlProvider({ children }: UrlProviderProps) {
  const [{ currentUrl, nextUrl }, dispatch] = useReducer(reducer, initialState);
  function updateUrlValues(url: State) {
    dispatch({ type: 'update-url', payload: url });
  }
  function resetUrlValues() {
    dispatch({ type: 'reset-url' });
  }

  return (
    <UrlContext.Provider
      value={{ currentUrl, nextUrl, updateUrlValues, resetUrlValues }}
    >
      {children}
    </UrlContext.Provider>
  );
}

// A custom hook to provide easy access to the ModalContext
function useUrlContext() {
  const context = useContext(UrlContext);
  if (context === undefined)
    throw new Error('URL context was used outside the UrlProvider');
  return context;
}

export { UrlProvider, useUrlContext };
