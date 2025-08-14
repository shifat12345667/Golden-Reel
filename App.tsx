
import React, { useState, useCallback } from 'react';
import { getVividWarmFilterCss } from './services/geminiService';
import { UploadIcon, SparklesIcon, ResetIcon } from './components/IconComponents';
import { Loader } from './components/Loader';

// Define components outside the main App component to prevent re-creation on re-renders.

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex justify-center w-full h-64 px-4 transition bg-gray-800 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-amber-500 focus:outline-none">
        <span className="flex flex-col items-center justify-center space-x-2">
           <UploadIcon className="w-12 h-12 text-gray-500"/>
          <span className="font-medium text-gray-400">
            Drop files to attach, or
            <span className="text-amber-500 underline ml-1">browse</span>
          </span>
           <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
        </span>
        <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleFileChange} />
      </label>
    </div>
  );
};

interface ImageDisplayProps {
  title: string;
  imageUrl: string;
  filterCss?: string | null;
  isLoading?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl, filterCss, isLoading = false }) => (
  <div className="w-full lg:w-1/2 p-2">
    <div className="relative aspect-square w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <h3 className="absolute top-0 left-0 w-full text-center py-2 bg-black bg-opacity-50 text-white font-semibold z-10">{title}</h3>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-all duration-500"
        style={{ filter: filterCss || 'none' }}
      />
      {isLoading && (
         <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
            <Loader />
         </div>
      )}
    </div>
  </div>
);


export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [filteredCss, setFilteredCss] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setFilteredCss(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = useCallback(async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);
    setFilteredCss(null);

    try {
      const cssFilter = await getVividWarmFilterCss();
      setFilteredCss(cssFilter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to apply filter. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);

  const handleReset = () => {
    setOriginalImage(null);
    setFilteredCss(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Cinematic <span className="text-amber-400">Vivid Warm</span> Filter
        </h1>
        <p className="mt-3 text-lg text-gray-400 max-w-3xl mx-auto">
          Upload a photo and let AI create a professional, film-like filter for a rich, moody, and vibrant look.
        </p>
      </header>
      
      <main className="w-full max-w-5xl flex-grow flex flex-col items-center">
        {!originalImage && <ImageUploader onImageUpload={handleImageUpload} />}
        
        {originalImage && (
          <>
            <div className="flex flex-col lg:flex-row w-full mb-6">
              <ImageDisplay title="Original" imageUrl={originalImage} />
              <ImageDisplay title="Vivid Warm" imageUrl={originalImage} filterCss={filteredCss} isLoading={isLoading} />
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative w-full max-w-4xl text-center mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <button
                onClick={applyFilter}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-amber-600 rounded-md shadow-lg hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-gray-900 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader small />
                    <span className="ml-2">Applying Filter...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Apply Vivid Warm Filter
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center px-8 py-3 font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-all duration-200"
              >
                <ResetIcon className="w-5 h-5 mr-2" />
                Reset
              </button>
            </div>
          </>
        )}
      </main>
      
      <footer className="w-full max-w-5xl text-center text-gray-500 mt-12 text-sm">
        <p>&copy; {new Date().getFullYear()} Cinematic Filters Inc. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
}
