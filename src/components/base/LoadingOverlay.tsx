import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoadingOverlayProps {
  show?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show }) => {
  return (
    <>
      {show && (
        <div className="fixed inset-0 bg-purple-400 bg-opacity-45 flex items-center justify-center z-50">
          <FiLoader className="text-white text-8xl animate-spin" />
        </div>
      )}
    </>
  );
};

export default LoadingOverlay;