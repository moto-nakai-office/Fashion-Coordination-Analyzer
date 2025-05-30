
import React, { useRef, DragEvent, ChangeEvent, useState, useEffect } from 'react';
import { UploadIcon, LinkIcon } from './icons'; // Added LinkIcon

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onAnalyze: () => void;
  imagePreviewUrl: string | null;
  isLoading: boolean; // Renamed from isAnalyzing
  uploadedImageFile: File | null;
  onUrlSubmit: (url: string) => void;
  currentUrl: string; // Controlled URL from App.tsx
  onUrlChange: (url: string) => void; // To update URL in App.tsx
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onAnalyze,
  imagePreviewUrl,
  isLoading,
  uploadedImageFile,
  onUrlSubmit,
  currentUrl,
  onUrlChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [internalImageUrl, setInternalImageUrl] = useState(''); // Use currentUrl and onUrlChange instead

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
      onUrlChange(''); // Clear URL input when local file is selected
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageSelect(event.dataTransfer.files[0]);
      onUrlChange(''); // Clear URL input when local file is selected by drop
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUrlInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUrlChange(event.target.value);
    // If user starts typing URL, consider clearing local file selection?
    // For now, App.tsx handles clearing local file if URL load is successful.
  };

  const handleUrlLoadClick = () => {
    if (currentUrl.trim()) {
      onUrlSubmit(currentUrl.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Local File Upload */}
      <div
        className={`border-2 border-dashed border-sky-600 rounded-lg p-8 text-center transition-colors duration-200 bg-slate-700 ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-sky-400'}`}
        onClick={!isLoading ? triggerFileInput : undefined}
        onDragOver={!isLoading ? handleDragOver : undefined}
        onDrop={!isLoading ? handleDrop : undefined}
      >
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <UploadIcon className="w-16 h-16 mx-auto text-sky-400 mb-4" />
        <p className="text-lg font-semibold text-sky-300 mb-1">
          画像をドラッグ＆ドロップ または クリックして選択
        </p>
        <p className="text-sm text-slate-400">
          (PNG, JPG, WEBP形式に対応)
        </p>
      </div>

      {/* Separator */}
      <div className="flex items-center my-4">
        <hr className="flex-grow border-t border-slate-600" />
        <span className="px-3 text-slate-400 font-medium">または</span>
        <hr className="flex-grow border-t border-slate-600" />
      </div>

      {/* URL Input */}
      <div className="space-y-3">
        <label htmlFor="imageUrl" className="block text-sm font-medium text-sky-300">
          画像URLから読み込む:
        </label>
        <div className="flex space-x-2">
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={currentUrl}
            onChange={handleUrlInputChange}
            placeholder="https://example.com/image.jpg"
            className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 text-slate-100 disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleUrlLoadClick}
            disabled={isLoading || !currentUrl.trim()}
            className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-5 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <LinkIcon className="w-5 h-5 mr-2" />
            読み込む
          </button>
        </div>
      </div>


      {imagePreviewUrl && (
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">プレビュー:</h3>
          <img
            src={imagePreviewUrl}
            alt="アップロードプレビュー"
            className="max-w-xs mx-auto rounded-lg shadow-md max-h-80 object-contain bg-slate-700 p-1"
          />
        </div>
      )}

      {(uploadedImageFile || (currentUrl && imagePreviewUrl)) && ( // Show analyze button if file or URL with preview
        <div className="mt-8 text-center">
          <button
            onClick={onAnalyze}
            disabled={isLoading || (!uploadedImageFile && !imagePreviewUrl)} // Disable if no valid image source
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '処理中...' : 'この画像で分析する'}
          </button>
        </div>
      )}
    </div>
  );
};
