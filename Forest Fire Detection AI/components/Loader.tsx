
import React from 'react';
import { FireIcon } from './icons';

export const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-dashed rounded-full animate-spin border-orange-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FireIcon className="w-12 h-12 text-orange-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
