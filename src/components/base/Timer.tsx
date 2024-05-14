import React, { useState, useEffect } from 'react';
import { FiCheck, FiCheckSquare, FiPlay, FiSkipBack } from 'react-icons/fi';

interface TimerProps {
    title: string;
    onChange: (timeElapsed: number) => void;
    onStart?: () => void;
    onStop?: () => void;
    onReset?: () => void;
}

const Timer: React.FC<TimerProps> = ({ title, onChange, onStart, onStop, onReset }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isInitial, setIsInitial] = useState(true); // Adicionamos uma variável para controlar se o temporizador está no estado inicial ou não

    let intervalId: NodeJS.Timeout;

    useEffect(() => {
        if (isRunning) {
            intervalId = setInterval(() => {
                setTimeElapsed(prevTime => {
                    const newTime = prevTime + 1;
                    onChange(newTime);
                    return newTime;
                });
            }, 1000);
        } else {
            clearInterval(intervalId);
        }

        return () => clearInterval(intervalId);
    }, [isRunning, onChange]);

    const handleStart = () => {
        setIsRunning(true);
        setIsInitial(false); // Quando o temporizador é iniciado, ele não está mais no estado inicial
        if (onStart) {
            onStart();
        }
    };

    const handleStop = () => {
        setIsRunning(false);
        setIsInitial(true); // Quando o temporizador é parado, ele volta ao estado inicial
        if (onStop) {
            onStop();
        }
    };

    const handleReset = () => {
        setTimeElapsed(0);
        setIsRunning(false);
        setIsInitial(true); // Quando o temporizador é reiniciado, ele volta ao estado inicial
        onChange(0);
        if (onReset) {
            onReset();
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            <p className="text-xl mb-4">Tempo decorrido: {formatTime(timeElapsed)}</p>
            {isInitial ? (
                <button onClick={handleStart} className="action-button-blue m-2">
                    <FiPlay className="m-2 text-2xl" /> {timeElapsed ? "Continuar" : "Inicializar"}
                </button>
            ) : (
                <>
                    <button onClick={handleStop} className="action-button-green m-2">
                        <FiCheckSquare className="m-2 text-2xl" /> Finalizar
                    </button>
                    <button onClick={handleReset} className="action-button-red m-2">
                        <FiSkipBack className="m-2 text-2xl" /> Reiniciar
                    </button>
                </>
            )}
        </div>
    );
};

export default Timer;