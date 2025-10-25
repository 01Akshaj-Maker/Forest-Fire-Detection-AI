
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { useVideoProcessor } from './hooks/useVideoProcessor';
import type { ProcessingState } from './types';
import { FireIcon } from './components/icons';

export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { state, progress, processedFrames, startProcessing, reset } = useVideoProcessor();

  const handleFileSelect = (file: File) => {
    reset();
    setVideoFile(file);
  };

  const handleStartAnalysis = () => {
    if (videoFile) {
      startProcessing(videoFile);
    }
  };

  const originalVideoUrl = useMemo(() => {
    if (videoFile) {
      return URL.createObjectURL(videoFile);
    }
    return null;
  }, [videoFile]);

  const renderContent = () => {
    switch (state) {
      case 'processing':
        return (
          <div className="w-full text-center">
            <Loader />
            <p className="text-xl font-semibold mt-4 text-orange-300">Analyzing Video...</p>
            <p className="text-gray-400 mt-2">This may take a few moments depending on the video length.</p>
            <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-2.5 mt-6">
              <div 
                className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress.percentage}%` }}>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-400">{`Processing frame ${progress.current} of ${progress.total}`}</p>
          </div>
        );
      case 'done':
        return (
          <ResultDisplay 
            originalVideoUrl={originalVideoUrl!} 
            processedFrames={processedFrames}
            onReset={reset}
          />
        );
      case 'idle':
      case 'error':
      default:
        return (
          <div className="w-full max-w-2xl mx-auto">
            <VideoUploader onFileSelect={handleFileSelect} videoFile={videoFile} />
             {state === 'error' && <p className="text-center text-red-500 mt-4">An error occurred during processing. Please try again.</p>}
            {videoFile && (
              <div className="text-center mt-8">
                <button
                  onClick={handleStartAnalysis}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
                >
                  <FireIcon className="w-6 h-6 mr-3" />
                  Start Analysis
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full flex-grow flex items-center justify-center container mx-auto px-4">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini. For demonstration purposes only.</p>
      </footer>
    </div>
  );
}
