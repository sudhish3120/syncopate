'use client';
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  type?: "success" | "error";
}

const Toast = ({ message, duration = 5000, onClose, type = "success" }: ToastProps) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match this with CSS animation duration
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`${
        type === "success" ? "bg-violet-600" : "bg-red-600"
      } text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3
      ${isClosing ? 'animate-fade-down' : 'animate-fade-up'}`}>
        <span>{message}</span>
        <button 
          onClick={handleClose}
          className="ml-2 hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
