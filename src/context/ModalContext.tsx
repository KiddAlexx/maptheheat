/* eslint-disable react-refresh/only-export-components */

// React imports
import { ReactNode, createContext, useContext, useReducer } from 'react';

// Data types
interface State {
  modalName: null | string;
  modalOpen: boolean;
  message: null | string;
  confirmAction: null | (() => void);
}

interface ModalContextType extends State {
  openModal: (modal: string) => void;
  closeModal: () => void;
  openDialog: (message: string, confirmAction: () => void) => void;
}

type Action =
  | { type: 'open-modal'; payload: string }
  | {
      type: 'open-dialog';
      payload: { message: string; confirmAction: () => void };
    }
  | { type: 'close-modal' };

interface ModalProviderProps {
  children: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const initialState = {
  modalName: null,
  modalOpen: false,
  message: null,
  confirmAction: null,
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'open-modal':
      return {
        ...state,
        modalName: action.payload,
        modalOpen: true,
      };
    case 'open-dialog':
      return {
        ...state,
        modalName: 'confirm-action',
        modalOpen: true,
        message: action.payload.message,
        confirmAction: action.payload.confirmAction,
      };

    case 'close-modal': {
      return {
        ...state,
        modalName: null,
        modalOpen: false,
        message: null,
        confirmAction: null,
      };
    }

    default:
      return state;
  }
}

function ModalProvider({ children }: ModalProviderProps) {
  const [{ modalName, modalOpen, message, confirmAction }, dispatch] =
    useReducer(reducer, initialState);
  function openModal(modal: string) {
    dispatch({ type: 'open-modal', payload: modal });
  }
  function openDialog(message: string, confirmAction: () => void) {
    const confirmActionAndClose = () => {
      confirmAction();
      closeModal();
    };
    dispatch({
      type: 'open-dialog',
      payload: { message, confirmActionAndClose },
    });
  }
  function closeModal() {
    dispatch({ type: 'close-modal' });
  }

  return (
    <ModalContext.Provider
      value={{
        modalName,
        modalOpen,
        openModal,
        closeModal,
        openDialog,
        message,
        confirmAction,
      }}
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
