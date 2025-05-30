
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { Loader } from './components/Loader';
import { analyzeFashionImage } from './services/geminiService';
import type { FashionAnalysis } from './types';
import { HeaderIcon } from './components/icons';

const App: React.FC = () => {
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FashionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>(''); // For URL input

  const handleImageUpload = useCallback((file: File) => {
    setUploadedImageFile(file);
    setAnalysisResult(null); 
    setError(null); 
    setImageUrlInput(''); // Clear URL input if a local file is selected
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleLoadFromUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setError("画像URLを入力してください。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setUploadedImageFile(null);
    setImagePreviewUrl(null); // Clear previous local preview

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`画像の読み込みに失敗しました: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
          throw new Error('指定されたURLは有効な画像ではありません。');
      }
      
      // Try to get filename from URL, or use a default
      let fileName = "image_from_url";
      try {
        const urlPath = new URL(url).pathname;
        const lastSegment = urlPath.substring(urlPath.lastIndexOf('/') + 1);
        if (lastSegment) {
            fileName = lastSegment;
        }
      } catch (e) {
        // Invalid URL for path parsing, use default
      }
      if (!/\.(jpe?g|png|webp)$/i.test(fileName) && blob.type) {
         const extension = blob.type.split('/')[1];
         fileName = `image_from_url.${extension || 'jpg'}`;
      }


      const file = new File([blob], fileName, { type: blob.type });
      
      // Use handleImageUpload's logic for preview, but it will clear imageUrlInput.
      // So, we need to handle preview setting here directly if we want to keep imageUrlInput state logic simple.
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      // No need to call handleImageUpload(file) if we set state here
      // setImageUrlInput(''); // Clear after successful load, or keep it for user reference? Let's clear.

    } catch (err) {
      console.error("URLからの画像読み込みエラー:", err);
      if (err instanceof Error) {
        setError(`URLからの画像読み込みに失敗しました: ${err.message}. CORSポリシーによりブロックされた可能性があります。`);
      } else {
        setError("URLからの画像読み込み中に不明なエラーが発生しました。");
      }
      setUploadedImageFile(null);
      setImagePreviewUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);


  const handleAnalyze = async () => {
    if (!uploadedImageFile) {
      setError("まず画像をアップロードまたはURLから読み込んでください。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeFashionImage(uploadedImageFile);
      setAnalysisResult(result);
    } catch (err) {
      console.error("分析エラー:", err);
      if (err instanceof Error) {
        setError(`分析中にエラーが発生しました: ${err.message}`);
      } else {
        setError("分析中に不明なエラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setUploadedImageFile(null);
    setImagePreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    setImageUrlInput(''); 
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 sm:py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center mb-3">
            <HeaderIcon className="w-12 h-12 text-sky-400 mr-3" />
            <h1 className="text-4xl font-bold text-slate-100 tracking-tight">
              ファッションコーデ アナライザー
            </h1>
          </div>
          <p className="text-lg text-sky-200">
            あなたのファッションをAIがスタイリッシュに分析します！
          </p>
        </header>

        <div className="bg-slate-800 text-slate-300 p-6 sm:p-8 rounded-xl shadow-2xl mb-8 transition-all duration-500 ease-in-out">
          {!analysisResult && !isLoading && (
            <ImageUploader
              onImageSelect={handleImageUpload}
              onAnalyze={handleAnalyze}
              imagePreviewUrl={imagePreviewUrl}
              isLoading={isLoading} // Changed from isAnalyzing
              uploadedImageFile={uploadedImageFile}
              onUrlSubmit={handleLoadFromUrl}
              currentUrl={imageUrlInput}
              onUrlChange={setImageUrlInput}
            />
          )}

          {isLoading && <Loader message="あなたのファッションを分析中... 少々お待ちください ✨" />}

          {error && (
            <div className="my-6 p-4 bg-red-900/30 border border-red-500 text-red-300 rounded-lg text-center">
              <p className="font-semibold">エラー</p>
              <p>{error}</p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <AnalysisDisplay analysis={analysisResult} imagePreviewUrl={imagePreviewUrl} />
          )}
          
          {(analysisResult || error || imagePreviewUrl) && !isLoading && (
             <div className="mt-8 text-center">
                <button
                  onClick={handleClear}
                  className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition duration-150 ease-in-out"
                >
                  別の画像を分析する
                </button>
              </div>
          )}
        </div>
        
        <footer className="text-center mt-12 text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} AI Fashion Analyzer. All rights reserved.</p>
          <p className="mt-1">Powered by Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
