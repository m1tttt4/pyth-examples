import { ReactNode } from 'react';

export type ModalProps = {
  isOpen?: boolean,
  onClose?: () => void,
  children?: ReactNode,
  hideClose?: void
}
