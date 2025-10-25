import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, DownloadIcon, ReplayIcon } from './icons';

interface ResultDisplayProps {
  originalVideoUrl: string;
  processedFrames: string[];
  onReset: () => void;
}

const FPS = 5;

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalVideoUrl, processedFrames, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !processedFrames[frameIndex]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = processedFrames[frameIndex];
    img.onload = () => {
      if (canvas.width !== img.width || canvas.height !== img.height) {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      ctx.drawImage(img, 0, 0);
    };
  }, [processedFrames]);

  // FIX: Replaced the complex and buggy animation loop with a simpler, more robust setInterval-based approach.
  useEffect(() => {
    if (isPlaying && processedFrames.length > 0) {
      if (videoRef.current?.paused) {
        videoRef.current.play();
      }

      const intervalId = setInterval(() => {
        setCurrentFrame(prevFrame => {
          const nextFrame = (prevFrame + 1) % processedFrames.length;
          if (nextFrame === 0 && prevFrame > 0) { // Condition to detect loop completion
            setIsPlaying(false);
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
            }
            return 0;
          }
          return nextFrame;
        });
      }, 1000 / FPS);

      return () => clearInterval(intervalId);
    } else {
      videoRef.current?.pause();
    }
  }, [isPlaying, processedFrames.length]);
  
  useEffect(() => {
    if (processedFrames.length > 0) {
      drawFrame(currentFrame);
    }
    if(videoRef.current) {
        const videoTime = currentFrame / FPS;
        if(Math.abs(videoRef.current.currentTime - videoTime) > 0.2) {
            videoRef.current.currentTime = videoTime;
        }
    }
  }, [currentFrame, drawFrame, processedFrames.length]);

  const handleTogglePlay = () => {
    // If playback is finished and user clicks play, restart from beginning
    if (!isPlaying && currentFrame === 0) {
        setIsPlaying(true);
    } else {
        setIsPlaying(prev => !prev);
    }
  };
  
  const handleDownloadFrame = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const link = document.createElement('a');
          link.download = `fire_detection_frame_${currentFrame}.png`;
          link.href = canvas.toDataURL();
          link.click();
      }
  };

  const handleReset = () => {
    onReset();
    if(videoRef.current) videoRef.current.src = "";
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">Original Video</h2>
          <video ref={videoRef} src={originalVideoUrl} controls muted className="w-full rounded-lg shadow-lg aspect-video bg-black"></video>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-orange-400">AI Processed Video</h2>
          <div className="w-full rounded-lg shadow-lg aspect-video bg-black flex items-center justify-center overflow-hidden">
             <canvas ref={canvasRef} className="w-full h-full object-contain"></canvas>
          </div>
        </div>
      </div>
      <div className="mt-8 flex items-center space-x-4">
        <button
          onClick={handleTogglePlay}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-4 rounded-full transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>
        <button
          onClick={handleDownloadFrame}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center"
        >
          <DownloadIcon className="w-5 h-5 mr-2"/>
          Download Current Frame
        </button>
        <button
          onClick={handleReset}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center"
        >
         <ReplayIcon className="w-5 h-5 mr-2"/>
          Analyze Another Video
        </button>
      </div>
    </div>
  );
};
