/* eslint-disable react-refresh/only-export-components */

// React imports
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';

// Data types
interface State {
  modalName: string;
  modalOpen: boolean;
  images: { url: string; alt: string; id: string }[];
  message: string;
  venueId: string;
  venueNameSlug: string;
  city: string;
  confirmAction: null | (() => void);
}

interface OpenModalUploadParams {
  modal: string;
  venueId: string;
  venueNameSlug: string;
  city: string;
}

interface ModalContextType extends State {
  openModal: (modal: string) => void;
  openModalImages: (
    modal: string,
    images: { url: string; alt: string; id: string }[]
  ) => void;
  openModalUpload: (params: OpenModalUploadParams) => void;
  closeModal: () => void;
  openDialog: (message: string, confirmAction?: () => void) => void;
}

type Action =
  | { type: 'open-modal'; payload: string }
  | {
      type: 'open-modal-images';
      payload: {
        modal: string;
        images: { url: string; alt: string; id: string }[];
      };
    }
  | {
      type: 'open-modal-upload';
      payload: {
        modal: string;
        venueId: string;
        venueNameSlug: string;
        city: string;
      };
    }
  | {
      type: 'open-dialog';
      payload: { message: string; confirmActionAndClose?: (() => void) | null };
    }
  | { type: 'close-modal' };

interface ModalProviderProps {
  children: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const initialState: State = {
  modalName: '',
  modalOpen: false,
  images: [],
  message: '',
  confirmAction: null,
  venueId: '',
  venueNameSlug: '',
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
        venueNameSlug: action.payload.venueNameSlug,
        modalOpen: true,
      };
    case 'open-dialog':
      return {
        ...state,
        modalName: 'confirm-action',
        modalOpen: true,
        message: action.payload.message,
        confirmAction: action.payload.confirmActionAndClose ?? null,
      };

    case 'close-modal': {
      return {
        ...state,
        modalName: '',
        modalOpen: false,
        message: '',
        confirmAction: null,
        images: [],
        venueNameSlug: '',
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
      venueNameSlug,
    },
    dispatch,
  ] = useReducer(reducer, initialState);
  const openModal = useCallback(
    (modal: string) => {
      dispatch({ type: 'open-modal', payload: modal });
    },
    [dispatch]
  );

  const openModalImages = useCallback(
    (modal: string, images: { url: string; alt: string; id: string }[]) => {
      dispatch({ type: 'open-modal-images', payload: { modal, images } });
    },
    [dispatch]
  );

  const openModalUpload = useCallback(
    ({ modal, venueId, venueNameSlug, city }: OpenModalUploadParams) => {
      dispatch({
        type: 'open-modal-upload',
        payload: { modal, venueId, venueNameSlug, city },
      });
    },
    [dispatch]
  );

  const closeModal = useCallback(() => {
    dispatch({ type: 'close-modal' });
  }, [dispatch]);

  const openDialog = useCallback(
    (message: string, confirmAction?: () => void) => {
      const confirmActionAndClose = confirmAction
        ? () => {
            confirmAction();
            closeModal();
          }
        : null;
      dispatch({
        type: 'open-dialog',
        payload: { message, confirmActionAndClose },
      });
    },
    [dispatch, closeModal]
  );

  const value = useMemo(
    () => ({
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
      venueNameSlug,
      message,
      confirmAction,
    }),
    [
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
      venueNameSlug,
      message,
      confirmAction,
    ]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
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
