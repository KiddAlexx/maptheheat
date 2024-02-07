import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './Modal.module.css';
import { useModalContext } from '../context/ModalContext';

interface ModalProps {
  children: ReactNode;
}

function Modal({ children }: ModalProps) {
  const { closeModal } = useModalContext();
  const [modalRoot, setModalRoot] = useState<Element | null>(null);

  useEffect(() => {
    setModalRoot(document.querySelector('#modal-root'));
  }, []);

  useEffect(() => {
    function escapeKeyHandler(e) {
      if (e.key === 'Escape') closeModal();
    }
    document.addEventListener('keydown', escapeKeyHandler);
    return () => {
      document.removeEventListener('keydown', escapeKeyHandler);
    };
  }, [closeModal]);

  if (!modalRoot) return null;

  return createPortal(
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContainer}> {children}</div>
    </div>,
    modalRoot
  );
}

export default Modal;
