import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './Modal.module.css';
import { useModalContext } from '../context/ModalContext';

interface ModalProps {
  children: ReactNode;
}

function Modal({ children }: ModalProps) {
  const { closeModal } = useModalContext();
  const [modalRoot, setModalRoot] = useState<Element | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModalRoot(document.querySelector('#modal-root'));
  }, []);

  useEffect(() => {
    function handleEscapeKeypress(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    document.addEventListener('keydown', handleEscapeKeypress);
    return () => {
      document.removeEventListener('keydown', handleEscapeKeypress);
    };
  }, [closeModal]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [closeModal]);

  if (!modalRoot) return null;

  return createPortal(
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContainer} ref={modalRef}>
        <button onClick={() => closeModal()} className={styles.modalCloseBtn}>
          x
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
}

export default Modal;
