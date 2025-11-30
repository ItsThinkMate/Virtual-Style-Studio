import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from './Button';
import { PhotoType } from '../types';

interface PhotoUploaderProps {
  label: string;
  type: PhotoType;
  currentPhoto: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  label, 
  currentPhoto, 
  onUpload, 
  onRemove 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      
      <div 
        className={`
          relative aspect-[3/4] w-full rounded-xl border-2 border-dashed 
          flex flex-col items-center justify-center overflow-hidden transition-all
          ${currentPhoto ? 'border-transparent' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'}
        `}
      >
        {currentPhoto ? (
          <>
            <img 
              src={currentPhoto} 
              alt={label} 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={onRemove}
              className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-red-600 hover:bg-white shadow-sm transition-colors"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
              <Camera className="text-gray-400" size={24} />
            </div>
            <p className="text-xs text-gray-500 mb-3">Drag & drop or click to upload</p>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Select Photo
            </Button>
          </div>
        )}
        <input 
          ref={inputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};