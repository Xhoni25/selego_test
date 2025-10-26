import React from 'react';
import {
  Modal as NextUIModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  isDismissable?: boolean;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  isDismissable = true,
  hideCloseButton = false,
}) => {
  return (
    <NextUIModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isDismissable={isDismissable}
      hideCloseButton={hideCloseButton}
      classNames={{
        base: 'bg-white dark:bg-gray-900',
        header: 'border-b border-gray-200 dark:border-gray-700',
        body: 'py-6',
        footer: 'border-t border-gray-200 dark:border-gray-700',
      }}
    >
      <ModalContent>
        {onClose => (
          <>
            {title && (
              <ModalHeader className='flex flex-col gap-1'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {title}
                </h3>
              </ModalHeader>
            )}
            <ModalBody>{children}</ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </NextUIModal>
  );
};

export default Modal;
