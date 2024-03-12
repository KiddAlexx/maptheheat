/* eslint-disable react-refresh/only-export-components */

// React imports
import { ReactNode, createContext, useContext, useReducer } from 'react';

// Data types
interface State {
  modalName: string;
  modalOpen: boolean;
  images: { url: string; alt: string }[];
  message: string;
  venueId: string;
  venueName: string;
  city: string;
  confirmAction: null | (() => void);
}

interface ModalContextType extends State {
  openModal: (modal: string) => void;
  openModalImages: (
    modal: string,
    images: { url: string; alt: string }[]
  ) => void;
  openModalUpload: (
    modal: string,
    venueId: string,
    venueName: string,
    city: string
  ) => void;
  closeModal: () => void;
  openDialog: (message: string, confirmAction: () => void) => void;
}

type Action =
  | { type: 'open-modal'; payload: string }
  | {
      type: 'open-modal-images';
      payload: { modal: string; images: { url: string; alt: string }[] };
    }
  | {
      type: 'open-modal-upload';
      payload: {
        modal: string;
        venueId: string;
        venueName: string;
        city: string;
      };
    }
  | {
      type: 'open-dialog';
      payload: { message: string; confirmActionAndClose: () => void };
    }
  | { type: 'close-modal' };

interface ModalProviderProps {
  children: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const initialState = {
  modalName: '',
  modalOpen: false,
  images: [],
  message: '',
  confirmAction: null,
  venueId: '',
  venueName: '',
  city: '',
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'open-modal':
      return {
        ...state,
        modalName: action.payload,
        modalOpen: true,
      };
    case 'open-modal-images':
      return {
        ...state,
        modalName: action.payload.modal,
        images: action.payload.images,
        modalOpen: true,
      };
    case 'open-modal-upload':
      return {
        ...state,
        modalName: action.payload.modal,
        venueId: action.payload.venueId,
        city: action.payload.city,
        venueName: action.payload.venueName,
        modalOpen: true,
      };
    case 'open-dialog':
      return {
        ...state,
        modalName: 'confirm-action',
        modalOpen: true,
        message: action.payload.message,
        confirmAction: action.payload.confirmActionAndClose,
      };

    case 'close-modal': {
      return {
        ...state,
        modalName: '',
        modalOpen: false,
        message: '',
        confirmAction: null,
        images: [],
        venueName: '',
        venueId: '',
        city: '',
      };
    }

    default:
      return state;
  }
}

function ModalProvider({ children }: ModalProviderProps) {
  const [
    {
      modalName,
      modalOpen,
      message,
      confirmAction,
      images,
      venueId,
      city,
      venueName,
    },
    dispatch,
  ] = useReducer(reducer, initialState);
  function openModal(modal: string) {
    dispatch({ type: 'open-modal', payload: modal });
  }
  function openModalImages(
    modal: string,
    images: { url: string; alt: string }[]
  ) {
    dispatch({ type: 'open-modal-images', payload: { modal, images } });
  }
  function openModalUpload(
    modal: string,
    venueId: string,
    venueName: string,
    city: string
  ) {
    dispatch({
      type: 'open-modal-upload',
      payload: { modal, venueId, venueName, city },
    });
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
        openModalImages,
        openModalUpload,
        images,
        venueId,
        city,
        venueName,
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
