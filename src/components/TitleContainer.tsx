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
    <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper/90 px-4 py-3 shadow-soft md:rounded-3xl md:px-6 md:py-4">
      <h1 className="inline-flex items-center gap-3 font-display text-xl text-ink md:text-2xl">
        {title} {textHelp && <Tooltip text={textHelp} />}
      </h1>
      <button
        onClick={handleBack}
        className="rounded-xl border border-ink/10 bg-ink-fixed px-3 py-2 text-sand-fixed shadow-soft transition-all hover:-translate-y-[1px] hover:bg-ink-fixed/90 hover:shadow-lift dark:bg-paper-fixed dark:text-ink-fixed dark:hover:bg-paper-fixed/90"
      >
        <FiSkipBack className="h-5 w-5" />
      </button>
    </div>
  );
};

export default TitleContainer;
