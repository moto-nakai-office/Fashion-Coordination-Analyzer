export interface KeyFashionItem {
  name: string;
  comment: string;
}

export interface PersonCharacteristics {
  hairStyle: string;
  hairColor: string;
  bodyShape: string;
  estimatedHeight: string;
  skeletalDiagnosis: string;
}

export interface FashionItemDetail {
  category: string; // e.g., "トップス", "アウター", "ボトムス", "シューズ", "アクセサリー", "帽子", "重ね着"
  name: string;
  description: string;
}

export interface FashionAnalysis {
  rating: number; // 1-5
  overallStyle: string;
  evaluationStatement: string; // e.g., "レベル５：最高！センス良すぎ！"
  positivePoints: string[];
  areasForImprovement: string[];
  improvementAdvice: string[];
  keyItems: KeyFashionItem[]; // This might become redundant or be re-evaluated later
  personCharacteristics: PersonCharacteristics;
  fashionItems: FashionItemDetail[];
  imageGenerationPrompt: string; // New field for image generation AI prompt
  personOnlyImageGenerationPrompt: string; // New field for person-focused image generation AI prompt
}