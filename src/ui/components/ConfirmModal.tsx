import { StyledModal } from '../utils/modals.js';
import { Button } from './Button.js';

export interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ onCancel, onConfirm, title = 'Confirm', message }: ConfirmModalProps) => {
  return (
    <StyledModal onClose={onCancel}>
      <h2>{title}</h2>
      <p>{message}</p>
      <Button onClick={onConfirm}>
        Confirm
      </Button>

      <Button type='button' onClick={onCancel}>
        Cancel
      </Button>
    </StyledModal>
  );
}