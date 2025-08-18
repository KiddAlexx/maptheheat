import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useModalContext } from '../context/ModalContext';
import FocusTrap from 'focus-trap-react';
import { useGlobalError } from '@/context/ErrorContext';
import { Icon } from '@iconify/react/dist/iconify.js';

interface ModalProps {
  children: ReactNode;
}

function Modal({ children }: ModalProps) {
  const { closeModal } = useModalContext();
  const { globalErrorMessage } = useGlobalError();
  const [modalRoot, setModalRoot] = useState<Element | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModalRoot(document.querySelector('#modal-root'));
  }, []);

  useEffect(() => {
    function handleEscapeKeypress(e: KeyboardEvent) {
      if (e.key === 'Escape' && !globalErrorMessage) closeModal();
    }
    document.addEventListener('keydown', handleEscapeKeypress);
    return () => {
      document.removeEventListener('keydown', handleEscapeKeypress);
    };
  }, [closeModal, globalErrorMessage]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        modalRef.current &&
        !globalErrorMessage &&
        !modalRef.current.contains(e.target as Node)
      ) {
        closeModal();
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [closeModal, globalErrorMessage]);

  if (!modalRoot) return null;

  return createPortal(
    <div className="fixed left-0 top-0 z-[2000] flex h-full w-full items-center justify-center bg-black/60">
      <FocusTrap
        focusTrapOptions={{
          initialFocus: '#firstElementToFocus',
        }}
      >
        <div
          className="relative flex items-center justify-center gap-5 rounded-xl bg-white p-5 shadow-[0_10px_20px_rgba(0,0,0,0.19),0_6px_6px_rgba(0,0,0,0.23)]"
          ref={modalRef}
        >
          <button
            onClick={() => closeModal()}
            className="absolute right-2 top-2 z-[2100]"
          >
            <Icon icon="material-symbols:cancel-rounded" width="26" />
          </button>
          {children}
        </div>
      </FocusTrap>
    </div>,
    modalRoot
  );
}

export default Modal;
