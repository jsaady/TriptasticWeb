import { PropsWithChildren, ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Button, LinkButton, PrimaryButton, SecondaryButton } from '../components/Button.js';

interface ModalState {
  content: ReactNode;
  setContent: (el: ReactNode) => void;
  outsideClickTs: number | null;
  setOutsideClickTs: (ts: number | null) => void;
}

const ModalContext = createContext<ModalState>(null as any);

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [content, setContent] = useState<ReactNode>(null);
  const [outsideClickTs, setOutsideClickTs] = useState<number | null>(null);

  return <ModalContext.Provider value={{ content, setContent, outsideClickTs, setOutsideClickTs }}>
    {children}
  </ModalContext.Provider>
};

export const ModalOutlet = () => {
  const { content, setOutsideClickTs } = useContext(ModalContext);

  const handleBackgroundClick = useCallback(() => setOutsideClickTs(Date.now()), [setOutsideClickTs]);

  // TODO: Add click handler to close modal
  return content ? <>
    <div className='absolute top-0 left-0 w-[100%] h-[100%] opacity-60 bg-black z-[1002]' onClick={handleBackgroundClick} />
    {content}
  </> : null;
};

interface ModalProps extends PropsWithChildren {
  onClose?: () => void;
}

export const Modal = ({ children, onClose }: ModalProps) => {
  const { setContent, outsideClickTs, setOutsideClickTs } = useContext(ModalContext);
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  useEffect(() => {
    if (outsideClickTs) {
      onClose?.();
      setOutsideClickTs(null);
    }
  }, [outsideClickTs]);

  useEffect(() => {
    setContent(children);

    return () => setContent(null);
  }, [children]);

  return null;
};

export interface StyledModalProps extends ModalProps {
  title?: string;
  primaryText?: string;
  onPrimaryClick?: () => void;
  secondaryText?: string;
  onSecondaryClick?: () => void;
  cancelText?: string;
}

export const StyledModal = ({ title, children, cancelText, primaryText, secondaryText, onPrimaryClick, onSecondaryClick, onClose }: StyledModalProps) => {
  return <Modal onClose={onClose}>
    {/* TODO: Finish styling and add animations */}
    <div className='bg-white dark:bg-neutral-900 dark:text-white p-5 rounded-lg shadow-lg z-[1002] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[50rem]'>
      {title && (
      <h2
        className='text-2xl font-bold mb-3 pb-3 border-b border-gray-300 dark:border-neutral-700'>
          {title}
        </h2>
      )}
      {children}
      <div className='mt-3 pt-3 border-t border-gray-300 dark:border-neutral-700 flex justify-between'>
        {cancelText && <LinkButton onClick={onClose}>{cancelText}</LinkButton>}
        <div>
          {primaryText && onPrimaryClick && <PrimaryButton onClick={onPrimaryClick}>{primaryText}</PrimaryButton>}
          {secondaryText && onSecondaryClick && <SecondaryButton onClick={onSecondaryClick}>{secondaryText}</SecondaryButton>}
        </div>
      </div>
    </div>
  </Modal>
};
