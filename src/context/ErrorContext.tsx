/* eslint-disable react-refresh/only-export-components */

//React imports
import { createContext, useContext, useReducer, ReactNode } from 'react';

// Data types
interface State {
  errorMessage: string | null;
}

interface GlobalErrorContextType extends State {
  clearError: () => void;
}

type Action = { type: 'clear-error' };

interface GlobalErrorProviderProps {
  children: ReactNode;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(
  undefined
);

const initialState = {
  errorMessage: null,
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'clear-error':
      return {
        ...state,
        errorMessage: null,
      };

    default:
      return state;
  }
}

function GlobalErrorProvider({ children }: GlobalErrorProviderProps) {
  const [{ errorMessage }, dispatch] = useReducer(reducer, initialState);

  function clearError() {
    console.log('Clearing error...');
    dispatch({ type: 'clear-error' });
  }

  return (
    <GlobalErrorContext.Provider
      value={{
        errorMessage,
        clearError,
      }}
    >
      {children}
    </GlobalErrorContext.Provider>
  );
}

// A custom hook to provide easy access to the GlobalErrorContext
function useGlobalError() {
  const context = useContext(GlobalErrorContext);
  if (context === undefined)
    throw new Error(
      'GlobalError context was used outside the GlobalErrorProvider'
    );
  return context;
}

export { GlobalErrorProvider, useGlobalError };
