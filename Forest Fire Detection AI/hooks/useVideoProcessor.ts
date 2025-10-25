
import { useState, useCallback, useRef } from 'react';
import type { ProcessingState, Progress, Detection } from '../types';
import { detectFireInFrame } from '../services/geminiService';

const FRAMES_PER_SECOND_TO_PROCESS = 5;

export function useVideoProcessor() {
  const [state, setState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState<Progress>({ current: 0, total: 0, percentage: 0 });
  const [processedFrames, setProcessedFrames] = useState<string[]>([]);
  const isProcessingRef = useRef(false);

  const reset = useCallback(() => {
    setState('idle');
    setProgress({ current: 0, total: 0, percentage: 0 });
    setProcessedFrames([]);
    isProcessingRef.current = false;
  }, []);

  const drawDetections = (
    ctx: CanvasRenderingContext2D,
    detections: Detection[],
    width: number,
    height: number
  ) => {
    if (detections.length === 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, 10, 220, 40);
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText('No Fire Detected', 20, 40);
      return;
    }
    
    detections.forEach(({ box, label }) => {
      const x = box.x * width;
      const y = box.y * height;
      const w = box.width * width;
      const h = box.height * height;

      ctx.strokeStyle = label === 'FIRE' ? '#FF5722' : '#B0BEC5';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = label === 'FIRE' ? '#FF5722' : '#B0BEC5';
      ctx.font = 'bold 18px sans-serif';
      const text = `${label}`;
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(x, y - 24, textWidth + 10, 24);
      
      ctx.fillStyle = 'white';
      ctx.fillText(text, x + 5, y - 5);
    });
  };

  const startProcessing = useCallback(async (videoFile: File) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setState('processing');
    setProcessedFrames([]);
    
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        setState('error');
        isProcessingRef.current = false;
        return;
    }

    await new Promise(resolve => {
        video.onloadedmetadata = resolve;
    });

    const duration = video.duration;
    const totalFrames = Math.floor(duration * FRAMES_PER_SECOND_TO_PROCESS);
    const frameInterval = 1 / FRAMES_PER_SECOND_TO_PROCESS;

    setProgress({ current: 0, total: totalFrames, percentage: 0 });
    
    const frames: string[] = [];
    
    for (let i = 0; i < totalFrames; i++) {
        if (!isProcessingRef.current) break; // Allow cancellation
        
        const time = i * frameInterval;
        video.currentTime = time;
        await new Promise(resolve => { video.onseeked = resolve; });

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const frameData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        const detections = await detectFireInFrame(frameData);
        
        // Redraw for output
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        drawDetections(ctx, detections, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.9));
        
        const percentage = Math.round(((i + 1) / totalFrames) * 100);
        setProgress({ current: i + 1, total: totalFrames, percentage });
    }
    
    setProcessedFrames(frames);
    setState('done');
    isProcessingRef.current = false;
    URL.revokeObjectURL(video.src);
  }, []);

  return { state, progress, processedFrames, startProcessing, reset };
}
