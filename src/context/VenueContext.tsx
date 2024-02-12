/* eslint-disable react-refresh/only-export-components */

//React imports
import { createContext, useContext, useReducer, ReactNode } from 'react';

// Data types
interface State {
  errorMessage: string | null;
}

interface VenueContextType extends State {
  clearError: () => void;
}

type Action = { type: 'clear-error' };

interface VenueProviderProps {
  children: ReactNode;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

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

function VenuesProvider({ children }: VenueProviderProps) {
  const [{ errorMessage }, dispatch] = useReducer(reducer, initialState);

  function clearError() {
    console.log('Clearing error...');
    dispatch({ type: 'clear-error' });
  }

  return (
    <VenueContext.Provider
      value={{
        errorMessage,
        clearError,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
}

// A custom hook to provide easy access to the VenueContext
function useVenues() {
  const context = useContext(VenueContext);
  if (context === undefined)
    throw new Error('Venue context was used outside the VenuesProvider');
  return context;
}

export { VenuesProvider, useVenues };
