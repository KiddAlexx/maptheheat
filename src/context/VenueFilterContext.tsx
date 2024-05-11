/* eslint-disable react-refresh/only-export-components */

// React imports
import { ReactNode, createContext, useContext, useReducer } from 'react';

// Data types
interface State {
  city: { value: string; method: string };
  venueType: { value: string; method: string };
}

interface VenueFilterContextType extends State {
  updateFilterCity: (value: string, method: string) => void;
  updateFilterVenueType: (value: string, method: string) => void;
}

type Action =
  | { type: 'update-filter-city'; payload: { value: string; method: string } }
  | {
      type: 'update-filter-venueType';
      payload: { value: string; method: string };
    };

interface VenueFilterProviderProps {
  children: ReactNode;
}

const VenueFilterContext = createContext<VenueFilterContextType | undefined>(
  undefined
);

const initialState = {
  city: { value: 'Barcelona', method: 'eq' },
  venueType: { value: '*', method: 'eq' },
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'update-filter-city':
      return {
        ...state,
        city: { value: action.payload.value, method: action.payload.method },
      };
    case 'update-filter-venueType':
      return {
        ...state,
        venueType: {
          value: action.payload.value,
          method: action.payload.method,
        },
      };
    default:
      return state;
  }
}

function VenueFilterProvider({ children }: VenueFilterProviderProps) {
  const [{ city, venueType }, dispatch] = useReducer(reducer, initialState);
  function updateFilterCity(value, method) {
    dispatch({ type: 'update-filter-city', payload: { value, method } });
  }
  function updateFilterVenueType(value, method) {
    dispatch({ type: 'update-filter-venueType', payload: { value, method } });
  }
  return (
    <VenueFilterContext.Provider
      value={{
        city,
        venueType,
        updateFilterCity,
        updateFilterVenueType,
      }}
    >
      {children}
    </VenueFilterContext.Provider>
  );
}

// A custom hook to provide easy access to the VenueFilterContex
function useVenueFilterContext() {
  const context = useContext(VenueFilterContext);
  if (context === undefined)
    throw new Error(
      'Venue filter context was used outside the VenueFilterProvider'
    );
  return context;
}

export { VenueFilterProvider, useVenueFilterContext };
