import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSkipBack } from 'react-icons/fi';


interface TitleContainerProps {
    title: string;
}

export const TitleContainer : React.FC<TitleContainerProps> = ({ title }) => {

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <div className="bg-purple-800 rounded-lg h-16 m-4 p-4">
            <h1 className="float-left text-xl text-white font-bold">{title}</h1>
            <button onClick={handleBack} className="float-right border-white border-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                <FiSkipBack className="w-4 h-4" />
            </button>
        </div>
    );
};
