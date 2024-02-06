/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useReducer } from 'react';

const ModalContext = createContext();

const initialState = {
  modalName: null,
  modalOpen: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'open-modal':
      return {
        ...state,
        modalName: action.payload,
        modalOpen: true,
      };
    case 'close-modal':
      return {
        ...state,
        modalName: null,
        modalOpen: false,
      };
    default:
      throw new Error('Unknown action type');
  }
}

function ModalProvider({ children }) {
  const [{ modalName, modalOpen }, dispatch] = useReducer(
    reducer,
    initialState
  );
  function openModal(modal) {
    dispatch({ type: 'open-modal', payload: modal });
  }

  return (
    <ModalContext.Provider value={{ modalName, modalOpen, openModal }}>
      {children}
    </ModalContext.Provider>
  );
}

// A custom hook to provide easy access to the ModalContext
function useModalContext() {
  const context = useContext(ModalContext);
  if (context === undefined)
    throw new Error('Modal context was used outside the ModalProvider');
  return context;
}

export { ModalProvider, useModalContext };
