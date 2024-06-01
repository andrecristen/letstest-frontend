import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  return (
    <div className="ml-2 relative flex items-center">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={showTooltip}
        className="cursor-pointer"
      >
        <FiInfo size={24} />
      </div>
      {isVisible && (
        <div className="bottom-full mb-2 p-2 bg-gray-700 text-white text-sm rounded shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
