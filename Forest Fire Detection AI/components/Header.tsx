
import React from 'react';
import { FireIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 w-full">
      <div className="flex items-center justify-center mb-2">
        <FireIcon className="w-12 h-12 text-orange-500 mr-3" />
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Forest Fire Detection AI
        </h1>
      </div>
      <p className="text-lg text-gray-400 max-w-3xl mx-auto">
        Upload a video to automatically detect and track fire or smoke using advanced computer vision.
      </p>
    </header>
  );
};
