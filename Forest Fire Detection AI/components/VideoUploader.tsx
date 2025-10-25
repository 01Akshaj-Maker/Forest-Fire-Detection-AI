
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, VideoIcon } from './icons';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  videoFile: File | null;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, videoFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onFileSelect(file);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow drop
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onFileSelect(file);
    }
  };
  
  const openFileDialog = () => {
      fileInputRef.current?.click();
  }

  return (
    <div
      onClick={openFileDialog}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-4 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragging ? 'border-orange-500 bg-gray-800' : 'border-gray-600 hover:border-orange-500 hover:bg-gray-800'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
      <div className="flex flex-col items-center text-gray-400">
        {videoFile ? (
            <>
                <VideoIcon className="w-16 h-16 mb-4 text-green-500" />
                <p className="text-xl font-semibold text-white">{videoFile.name}</p>
                <p className="mt-2">Ready for analysis. Click the button below to start.</p>
                <p className="mt-4 text-sm bg-orange-600/50 border border-orange-500 text-orange-200 px-4 py-2 rounded-lg">
                    Click here to choose a different video file.
                </p>
            </>
        ) : (
            <>
                <UploadIcon className="w-16 h-16 mb-4" />
                <p className="text-xl font-semibold text-white">Drag & Drop a Video File</p>
                <p className="mt-2">or click to browse</p>
                <p className="mt-4 text-sm text-gray-500">Supports MP4, WebM, OGG, etc.</p>
            </>
        )}
      </div>
    </div>
  );
};
