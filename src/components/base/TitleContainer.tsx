import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSkipBack } from 'react-icons/fi';

interface TitleContainerProps {
  title: string;
}

const TitleContainer: React.FC<TitleContainerProps> = ({ title }) => {

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex justify-between items-center bg-purple-800 rounded-lg h-16 px-6 m-4">
      <h1 className="text-2xl text-white font-bold">{title}</h1>
      <button
        onClick={handleBack}
        className="border border-white bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        <FiSkipBack className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TitleContainer;