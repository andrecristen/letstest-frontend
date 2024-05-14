import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiPlay, FiSkipBack, FiVideo } from 'react-icons/fi';

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
    const [isInitial, setIsInitial] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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
    }, [isRunning, isRecording, onChange]);

    const handleStart = () => {
        setIsRunning(true);
        setIsInitial(false);
        if (onStart) {
            onStart();
        }
    };

    const handleStop = () => {
        setIsRunning(false);
        setIsInitial(true);
        stopRecorder();
        if (onStop) {
            onStop();
        }
    };

    const handleReset = () => {
        setTimeElapsed(0);
        setIsRunning(false);
        setIsInitial(true);
        onChange(0);
        stopRecorder();
        if (onReset) {
            onReset();
        }
    };

    const stopRecorder = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    }

    const handleRecord = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia();

            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            const chunks: Blob[] = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.href = url;
                a.download = `Gravação de Tela - ${Date.now()}.webm`;
                a.click();
                window.URL.revokeObjectURL(url);
                setIsRecording(false);
            };

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Erro ao iniciar a gravação:', error);
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
                <button type="button" onClick={handleStart} className="action-button-blue m-2">
                    <FiPlay className="m-2 text-2xl" /> {timeElapsed ? "Continuar" : "Inicializar"}
                </button>
            ) : (
                <>
                    <button type="button" onClick={handleStop} className="action-button-red m-2">
                        <FiCheckSquare className="m-2 text-2xl" /> Finalizar
                    </button>
                    <button type="button" onClick={handleReset} className="action-button-teal m-2">
                        <FiSkipBack className="m-2 text-2xl" /> Reiniciar
                    </button>
                    {!isRecording && (
                        <button type="button" onClick={handleRecord} className="action-button-purple m-2">
                            <FiVideo className="m-2 text-2xl" /> Gravar Tela
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default Timer;