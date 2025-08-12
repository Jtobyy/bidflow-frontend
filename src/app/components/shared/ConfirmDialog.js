'use client';
import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  loading = false,
  danger = false, // renders the confirm button in red when true
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={title}
      showFooter
      width="480px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded cursor-pointer border border-[#254c7c] text-[#08305e] bg-[#fffce8] hover:bg-[#08305e]/10 disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded cursor-pointer text-white font-semibold shadow disabled:opacity-60
              ${danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#38a0f7] hover:bg-[#256bb7]'
              }`}
          >
            {loading ? 'Please wait…' : confirmText}
          </button>
        </>
      }
    >
      <p className="text-[#08305e] leading-relaxed">{message}</p>
    </Modal>
  );
}
