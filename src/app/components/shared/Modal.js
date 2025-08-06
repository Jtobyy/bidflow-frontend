import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showFooter = true,
  width = "500px",
  showBorder = true,
  footer
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(8,48,94,0.10)] flex items-center justify-center z-30 p-4">
      <div
        className="rounded-2xl shadow-2xl w-full flex flex-col bg-[#fffce8] border border-[#fffce8]"
        style={{
          maxWidth: width,
          maxHeight: 'calc(100vh - 2rem)'
        }}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center w-full py-3 px-6 rounded-t-2xl ${
            showBorder ? 'border-b border-[#254c7c]' : ''
          } bg-[#08305e]`}
        >
          <p className="text-lg font-bold text-[#fffce8] flex items-center">
            {title}
          </p>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#254c7c] rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <FontAwesomeIcon
              icon={faXmark}
              className="w-5 h-5 text-[#fffce8]"
            />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-6 pb-6 overflow-y-auto flex-grow text-[#08305e]">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="px-6 py-6 flex justify-end gap-3 border-t border-[#254c7c] mt-auto bg-[#fffce8] rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>

      {/* Backdrop click handler */}
      <div
        className="fixed inset-0 z-[-1]"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
};

export default Modal;
