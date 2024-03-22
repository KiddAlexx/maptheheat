import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdCancel } from 'react-icons/md';

import styles from './Modal.module.css';
import { useModalContext } from '../context/ModalContext';
import FocusTrap from 'focus-trap-react';
import { useGlobalError } from '@/context/ErrorContext';

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
    <div className={styles.modalBackdrop}>
      <FocusTrap
        focusTrapOptions={{
          initialFocus: '#firstElementToFocus',
        }}
      >
        <div className={styles.modalContainer} ref={modalRef}>
          <button onClick={() => closeModal()} className={styles.modalCloseBtn}>
            <MdCancel className={styles.modalCloseIcon} />
          </button>
          {children}
        </div>
      </FocusTrap>
    </div>,
    modalRoot
  );
}

export default Modal;
