import React, { useRef, useState, useEffect } from 'react';
import { FiCheckSquare, FiPlay, FiSkipBack, FiVideo } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../ui';

interface TimerProps {
    title: string;
    disabled?: boolean;
    onChange: (timeElapsed: number) => void;
    onStart?: () => void;
    onStop?: () => void;
    onReset?: () => void;
    onPause?: () => void;
    onResume?: () => void;
}

const Timer: React.FC<TimerProps> = ({
    title,
    disabled,
    onChange,
    onStart,
    onStop,
    onReset,
    onPause,
    onResume
}) => {
    const { t } = useTranslation();

    const [isRunning, setIsRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isInitial, setIsInitial] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeElapsed(prevTime => {
                    const newTime = prevTime + 1;
                    onChange(newTime);
                    return newTime;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, isRecording, onChange]);

    const handleStart = () => {
        setIsRunning(true);
        setIsInitial(false);
        setIsPaused(false);
        if (onStart) {
            onStart();
        }
    };

    const handleStop = () => {
        setIsRunning(false);
        setIsInitial(true);
        setIsPaused(false);
        stopRecorder();
        if (onStop) {
            onStop();
        }
    };

    const handlePause = () => {
        setIsRunning(false);
        setIsPaused(true);
        if (onPause) {
            onPause();
        }
    };

    const handleResume = () => {
        setIsRunning(true);
        setIsPaused(false);
        if (onResume) {
            onResume();
        }
    };

    const handleReset = () => {
        setTimeElapsed(0);
        setIsRunning(false);
        setIsInitial(true);
        setIsPaused(false);
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
            console.error(t('timer.recordError'), error);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <Card className="space-y-4">
            <div>
                <h1 className="font-display text-2xl text-ink">{title}</h1>
            </div>
            <p className="text-xl text-ink/70">{t('timer.elapsed', { time: formatTime(timeElapsed) })}</p>
            {isInitial ? (
                <Button
                    disabled={disabled}
                    type="button"
                    onClick={handleStart}
                    leadingIcon={<FiPlay />}
                >
                    {timeElapsed ? t('timer.continue') : t('timer.start')}
                </Button>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {isRunning ? (
                        <Button type="button" variant="outline" onClick={handlePause} leadingIcon={<FiSkipBack />}>
                            {t('timer.pause')}
                        </Button>
                    ) : isPaused ? (
                        <Button type="button" onClick={handleResume} leadingIcon={<FiPlay />}>
                            {t('timer.resume')}
                        </Button>
                    ) : null}
                    <Button type="button" variant="outline" onClick={handleReset} leadingIcon={<FiSkipBack />}>
                        {t('timer.reset')}
                    </Button>
                    <Button type="button" variant="danger" onClick={handleStop} leadingIcon={<FiCheckSquare />}>
                        {t('timer.finish')}
                    </Button>
                    {!isRecording && (
                        <Button type="button" variant="ghost" onClick={handleRecord} leadingIcon={<FiVideo />}>
                            {t('timer.recordScreen')}
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
};

export default Timer;
