import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSkipBack } from 'react-icons/fi';
import Tooltip from './Tooltip';

interface TitleContainerProps {
  title: string;
  textHelp?: string;
}

const TitleContainer: React.FC<TitleContainerProps> = ({ title, textHelp }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper/80 px-6 py-4 shadow-soft">
      <h1 className="inline-flex items-center gap-3 font-display text-2xl text-ink">
        {title} {textHelp && <Tooltip text={textHelp} />}
      </h1>
      <button
        onClick={handleBack}
        className="rounded-xl border border-ink/10 bg-ink px-3 py-2 text-sand transition-colors hover:bg-ink/90"
      >
        <FiSkipBack className="h-5 w-5" />
      </button>
    </div>
  );
};

export default TitleContainer;
