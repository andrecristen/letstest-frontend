import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(!isVisible);
  const hideTooltip = () => setIsVisible(false);

  return (
    <div className="ml-2 relative flex items-center">
      <div
        onClick={showTooltip}
        className="cursor-pointer"
      >
        <FiInfo size={24} />
      </div>
      {isVisible && (
        <div onClick={hideTooltip} className="cursor-pointer bottom-full mb-2 p-2 bg-gray-700 text-white text-sm rounded shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
