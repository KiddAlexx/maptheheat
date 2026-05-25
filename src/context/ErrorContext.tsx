/* eslint-disable react-refresh/only-export-components */

//React imports
import { createContext, useContext, useReducer, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

// Data types
interface State {
  globalErrorMessage: string | null;
}

interface GlobalErrorContextType extends State {
  clearGlobalError: () => void;
  setGlobalError: (message: string) => void;
}

type Action =
  | { type: 'clear-error' }
  | { type: 'set-error'; payload: { message: string } };

interface GlobalErrorProviderProps {
  children: ReactNode;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(
  undefined
);

const initialState: State = {
  globalErrorMessage: null,
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'clear-error':
      return {
        ...state,
        globalErrorMessage: null,
      };
    case 'set-error':
      return {
        ...state,
        globalErrorMessage: action.payload.message,
      };

    default:
      return state;
  }
}

function GlobalErrorProvider({ children }: GlobalErrorProviderProps) {
  const [{ globalErrorMessage }, dispatch] = useReducer(reducer, initialState);

  function clearGlobalError() {
    dispatch({ type: 'clear-error' });
  }

  function setGlobalError(message: string) {
    Sentry.captureMessage(message, 'error');
    dispatch({ type: 'set-error', payload: { message } });
  }

  return (
    <GlobalErrorContext.Provider
      value={{
        globalErrorMessage,
        clearGlobalError,
        setGlobalError,
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
