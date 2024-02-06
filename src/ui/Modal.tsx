import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './Modal.module.css';

interface ModalProps {
  children: ReactNode;
}

function Modal({ children }: ModalProps) {
  const [modalRoot, setModalRoot] = useState<Element | null>(null);

  useEffect(() => {
    setModalRoot(document.querySelector('#modal-root'));
  }, []);

  if (!modalRoot) return null;

  return createPortal(
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContainer}> {children}</div>
    </div>,
    modalRoot
  );
}

export default Modal;
