import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CloseOutlined } from '@ant-design/icons';

interface CustomModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  className?: string;
}

const CustomModal = ({
  title,
  isOpen,
  onClose,
  children,
  footer,
  width = '600px',
  className = ''
}: CustomModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle ESC key to close the modal
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Handle clicking outside to close
  useEffect(() => {
    if (!isOpen) return;
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div className="custom-modal-overlay">
      <div 
        ref={modalRef}
        className={`custom-modal ${className}`}
        style={{ maxWidth: width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="custom-modal__header">
          <h3 id="modal-title">{title}</h3>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseOutlined />
          </button>
        </div>
        
        <div className="custom-modal__body">
          {children}
        </div>
        
        {footer && (
          <div className="custom-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CustomModal;
