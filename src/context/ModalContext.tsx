/* eslint-disable react-refresh/only-export-components */

// React imports
import { ReactNode, createContext, useContext, useReducer } from 'react';

// Data types
interface State {
  modalName: null | string;
  modalOpen: boolean;
}

interface ModalContextType extends State {
  openModal: (modal: string) => void;
  closeModal: () => void;
}

type Action = { type: 'open-modal'; payload: string } | { type: 'close-modal' };

interface ModalProviderProps {
  children: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const initialState = {
  modalName: null,
  modalOpen: false,
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'open-modal':
      return {
        ...state,
        modalName: action.payload,
        modalOpen: true,
      };

    case 'close-modal': {
      return {
        ...state,
        modalName: null,
        modalOpen: false,
      };
    }

    default:
      return state;
  }
}

function ModalProvider({ children }: ModalProviderProps) {
  const [{ modalName, modalOpen }, dispatch] = useReducer(
    reducer,
    initialState
  );
  function openModal(modal: string) {
    dispatch({ type: 'open-modal', payload: modal });
  }
  function closeModal() {
    dispatch({ type: 'close-modal' });
  }

  return (
    <ModalContext.Provider
      value={{ modalName, modalOpen, openModal, closeModal }}
    >
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
