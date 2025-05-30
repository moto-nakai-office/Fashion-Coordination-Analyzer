import React, { useState, useCallback } from 'react';
import type { FashionAnalysis, FashionItemDetail } from '../types';
import { ItemCard } from './ItemCard';
import { StyleIcon, EvaluationIcon, ItemsIcon, StarIcon, ThumbUpIcon, SparklesIcon, PersonIcon, HangerIcon, SparkleMagicIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from './icons'; // Added SparkleMagicIcon and Clipboard icons

interface AnalysisDisplayProps {
  analysis: FashionAnalysis;
  imagePreviewUrl: string | null;
}

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const totalStars = 5;
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => (
        <StarIcon
          key={index}
          className={`w-7 h-7 ${index < rating ? 'text-yellow-400' : 'text-slate-300'}`}
        />
      ))}
      <span className="ml-2 text-xl font-semibold text-slate-700">{rating}/5</span>
    </div>
  );
};

const FashionItemsByCategory: React.FC<{ items: FashionItemDetail[] }> = ({ items }) => {
  const groupedItems = items.reduce((acc, item) => {
    acc[item.category] = [...(acc[item.category] || []), item];
    return acc;
  }, {} as Record<string, FashionItemDetail[]>);

  const categoryOrder = ["帽子", "アウター", "ジャケット", "トップス", "重ね着", "ボトムス", "シューズ", "アクセサリー"];
  
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="space-y-4">
      {sortedCategories.map(category => (
        <div key={category}>
          <h4 className="text-lg font-semibold text-sky-700 mb-2">{category}</h4>
          <ul className="list-disc list-inside space-y-1 pl-2">
            {groupedItems[category].map((item, index) => (
              <li key={index} className="text-slate-700">
                <span className="font-medium">{item.name}:</span> {item.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, imagePreviewUrl }) => {
  const { personCharacteristics, fashionItems, imageGenerationPrompt, personOnlyImageGenerationPrompt } = analysis;
  const [isDetailedCopied, setIsDetailedCopied] = useState(false);
  const [isPersonOnlyCopied, setIsPersonOnlyCopied] = useState(false);

  const handleCopyPrompt = useCallback((promptText: string | undefined, type: 'detailed' | 'personOnly') => {
    if (promptText) {
      navigator.clipboard.writeText(promptText).then(() => {
        if (type === 'detailed') {
          setIsDetailedCopied(true);
          setTimeout(() => setIsDetailedCopied(false), 2000);
        } else if (type === 'personOnly') {
          setIsPersonOnlyCopied(true);
          setTimeout(() => setIsPersonOnlyCopied(false), 2000);
        }
      }).catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
        alert('クリップボードへのコピーに失敗しました。');
      });
    }
  }, []);


  return (
    <div className="space-y-8 animate-fadeIn">
      {imagePreviewUrl && (
        <div className="mb-8 text-center">
          <img 
            src={imagePreviewUrl} 
            alt="分析対象の画像" 
            className="max-w-sm mx-auto rounded-lg shadow-xl max-h-96 object-contain bg-slate-700 p-1"
          />
        </div>
      )}
      
      <Section 
        title="スタイリスト評価" 
        icon={<EvaluationIcon className="w-6 h-6 mr-2 text-sky-500" />}
        titleExtra={<RatingStars rating={analysis.rating} />}
      >
        <p className="text-slate-700 text-lg italic">"{analysis.evaluationStatement}"</p>
      </Section>

      <Section title="全体のスタイル" icon={<StyleIcon className="w-6 h-6 mr-2 text-blue-500" />}>
        <p className="text-slate-700 text-lg whitespace-pre-line leading-relaxed">{analysis.overallStyle}</p>
      </Section>

      {analysis.positivePoints && analysis.positivePoints.length > 0 && (
        <Section title="ここがイイね！ポイント" icon={<ThumbUpIcon className="w-6 h-6 mr-2 text-green-500" />}>
          <ul className="list-disc list-inside space-y-1 pl-2">
            {analysis.positivePoints.map((point, index) => (
              <li key={index} className="text-slate-700 whitespace-pre-line leading-relaxed">{point}</li>
            ))}
          </ul>
        </Section>
      )}

      {(analysis.areasForImprovement && analysis.areasForImprovement.length > 0) || (analysis.improvementAdvice && analysis.improvementAdvice.length > 0) ? (
        <Section title="改善点＆アドバイス" icon={<SparklesIcon className="w-6 h-6 mr-2 text-indigo-500" />}>
          {analysis.areasForImprovement && analysis.areasForImprovement.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-slate-600 mb-1">惜しいかもポイント：</h4>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {analysis.areasForImprovement.map((point, index) => (
                  <li key={index} className="text-slate-700 whitespace-pre-line leading-relaxed">{point}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.improvementAdvice && analysis.improvementAdvice.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-slate-600 mb-1">こうすればもっと素敵に：</h4>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {analysis.improvementAdvice.map((point, index) => (
                  <li key={index} className="text-slate-700 whitespace-pre-line leading-relaxed">{point}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      ) : null}
      
      {analysis.keyItems && analysis.keyItems.length > 0 && (
        <Section title="注目ファッションアイテム (AI選)" icon={<ItemsIcon className="w-6 h-6 mr-2 text-cyan-500" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.keyItems.map((item, index) => (
              <ItemCard key={index} item={item} />
            ))}
          </div>
        </Section>
      )}

      {personCharacteristics && (
        <Section title="あなたの特徴" icon={<PersonIcon className="w-6 h-6 mr-2 text-teal-500" />}>
          <div className="space-y-2 text-slate-700">
            <p><strong className="font-medium">髪型:</strong> {personCharacteristics.hairStyle || "N/A"}</p>
            <p><strong className="font-medium">髪色:</strong> {personCharacteristics.hairColor || "N/A"}</p>
            <p><strong className="font-medium">体型:</strong> {personCharacteristics.bodyShape || "N/A"}</p>
            <p><strong className="font-medium">推定身長:</strong> {personCharacteristics.estimatedHeight || "N/A"}</p>
            <p><strong className="font-medium">骨格診断 (推定):</strong> {personCharacteristics.skeletalDiagnosis || "N/A"}</p>
          </div>
        </Section>
      )}

      {fashionItems && fashionItems.length > 0 && (
        <Section title="着用アイテムリスト" icon={<HangerIcon className="w-6 h-6 mr-2 text-orange-500" />}>
          <FashionItemsByCategory items={fashionItems} />
        </Section>
      )}

      {imageGenerationPrompt && (
        <Section title="画像生成AI用プロンプト (詳細版)" icon={<SparkleMagicIcon className="w-6 h-6 mr-2 text-purple-500" />}>
          <div className="relative">
            <pre className="bg-slate-100 p-4 rounded-md text-sm text-slate-700 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-60 overflow-y-auto">
              {imageGenerationPrompt}
            </pre>
            <button
              onClick={() => handleCopyPrompt(imageGenerationPrompt, 'detailed')}
              title={isDetailedCopied ? "コピーしました！" : "プロンプトをコピー"}
              aria-label={isDetailedCopied ? "プロンプトをコピーしました" : "画像生成AI用プロンプトをクリップボードにコピーする"}
              className={`absolute top-2 right-2 p-2 rounded-md transition-colors duration-150 ease-in-out
                          ${isDetailedCopied 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
            >
              {isDetailedCopied ? 
                <ClipboardDocumentCheckIcon className="w-5 h-5" /> :
                <ClipboardDocumentIcon className="w-5 h-5" />
              }
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            上記のプロンプトは英語で生成されています。画像生成AI (DALL-E, Midjourney, Stable Diffusionなど) でご利用ください。
          </p>
        </Section>
      )}
      
      {personOnlyImageGenerationPrompt && (
        <Section title="人物フォーカス 画像生成AI用プロンプト" icon={<PersonIcon className="w-6 h-6 mr-2 text-pink-500" />}>
          <div className="relative">
            <pre className="bg-slate-100 p-4 rounded-md text-sm text-slate-700 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-60 overflow-y-auto">
              {personOnlyImageGenerationPrompt}
            </pre>
            <button
              onClick={() => handleCopyPrompt(personOnlyImageGenerationPrompt, 'personOnly')}
              title={isPersonOnlyCopied ? "コピーしました！" : "プロンプトをコピー"}
              aria-label={isPersonOnlyCopied ? "プロンプトをコピーしました" : "人物フォーカス画像生成AI用プロンプトをクリップボードにコピーする"}
              className={`absolute top-2 right-2 p-2 rounded-md transition-colors duration-150 ease-in-out
                          ${isPersonOnlyCopied 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
            >
              {isPersonOnlyCopied ? 
                <ClipboardDocumentCheckIcon className="w-5 h-5" /> :
                <ClipboardDocumentIcon className="w-5 h-5" />
              }
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            このプロンプトは人物の特徴のみに焦点を当てて英語で生成されています。服装や背景は含まれません。
          </p>
        </Section>
      )}


      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  titleExtra?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, titleExtra }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 text-slate-700">
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
      <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
        {icon}
        {title}
      </h2>
      {titleExtra}
    </div>
    {children}
  </div>
);