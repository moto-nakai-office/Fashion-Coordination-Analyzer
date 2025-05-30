
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import type { FashionAnalysis, KeyFashionItem, PersonCharacteristics, FashionItemDetail } from '../types';

if (!process.env.API_KEY) {
  throw new Error("APIキーが設定されていません。環境変数 'API_KEY' を設定してください。");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("ファイルの読み込みに失敗しました。"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  try {
    const base64Data = await base64EncodedDataPromise;
    return {
      inlineData: { data: base64Data, mimeType: file.type },
    };
  } catch (error) {
    console.error("Base64エンコードエラー:", error);
    throw new Error("画像の処理中にエラーが発生しました。");
  }
};

export const analyzeFashionImage = async (imageFile: File): Promise<FashionAnalysis> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `
あなたは、ファッション感度が高く、最新トレンドにも詳しいおしゃれな友人AIです。提供された画像に写っている人物のファッションコーディネートを詳細に分析し、評価してください。

分析項目：
1.  **総合評価:** 1から5の段階評価とその評価に対応する短い声明文。
2.  **全体的なスタイル:** コーディネート全体のスタイル、雰囲気、適したシーン、その評価理由。
3.  **良い点:** 具体的なアイテムや着こなしに触れ、最低3つの良い点を記述。各点がなぜ良いのか、全体にどう影響しているかを明確に。
4.  **改善点:** 具体的なアイテムや着こなしに触れ、最低2つの改善点を記述。各点がなぜ改善点と感じるか、どうすれば良くなるかを具体的に。
5.  **改善アドバイス:** 具体的な改善案を最低2つ提示。手持ちアイテムでの工夫、推奨アイテム、着こなしのコツ、期待される印象の変化を詳細に。
6.  **注目ファッションアイテム:** 特に目を引いたアイテムを1つ以上選び、名称とそのアイテムがコーディネートで果たしている役割、特徴、他のアイテムとの組み合わせ方や着こなしのポイントを詳細にコメント（最低50文字程度）。
7.  **人物の特徴:** 画像から読み取れる範囲で、髪型、髪色、体型、推定身長、骨格診断（推定）を記述。判断困難な場合はその旨を記載。
8.  **着用アイテムリスト:** 帽子、アウター、ジャケット、トップス、重ね着、ボトムス、シューズ、アクセサリーのカテゴリに分類し、各アイテムの名称と特徴（素材、色、デザイン、ディテールなど）を記述。画像にないカテゴリは省略可。
9.  **画像生成AI用プロンプト (詳細版):** 分析した画像を再現するための、非常に詳細なプロンプトを英語で作成してください。このプロンプトは、画像生成AI (例: Stable Diffusion, DALL-E, Midjourney) で使用することを想定しています。以下の要素を可能な限り具体的に、英語のキーワードやフレーズをカンマ区切りで含めてください。再現性を高めるため、細部まで念入りに記述してください。
    *   Subject Focus: (e.g., full body shot of a young woman, medium shot of a man from the waist up)
    *   Person Details: (e.g., early 20s, smiling, confident pose, detailed facial features if prominent, body type)
    *   Clothing Items (for each item): Type, Color, Material/Texture, Details/Patterns, Fit
    *   Accessories: (e.g., delicate gold necklace, black leather belt)
    *   Footwear: (e.g., white chunky sneakers, black leather ankle boots)
    *   Hairstyle & Color: (e.g., shoulder-length wavy blonde hair, short spiky dark brown hair)
    *   Makeup (if visible/prominent): (e.g., natural look, smoky eyes)
    *   Background/Setting: (e.g., blurred urban street, minimalist studio background)
    *   Lighting: (e.g., soft natural daylight, golden hour lighting)
    *   Art Style/Photography Style: (e.g., fashion photography, realistic, photorealistic, cinematic)
    *   Camera View/Angle: (e.g., eye-level shot, low-angle shot)
    *   Additional Details: (e.g., holding a coffee cup, looking at camera)
10. **人物フォーカス 画像生成AI用プロンプト (人物のみ):** 画像に写っている人物そのものを再現するための、詳細なプロンプトを英語で作成してください。服装、アクセサリー、具体的な背景は含めず、人物の身体的特徴、髪型、髪色、顔の特徴（可能な範囲で）、体型、ポーズ、表情に焦点を当ててください。このプロンプトは、人物を単独で生成し、後から異なる服装や背景と組み合わせることを想定しています。
    *   Person Description: (e.g., detailed description of facial features like eye color, nose shape if clear, lip shape. Overall face shape. Skin tone.)
    *   Hair: (e.g., very detailed hairstyle, texture, length, color, e.g., "long, straight, jet black hair, slightly layered, with side-swept bangs covering the right eyebrow")
    *   Body Type/Build: (e.g., slender build, athletic physique, average build, refer to skeletalDiagnosis for hints if applicable like "appears to have a straight skeletal frame")
    *   Pose & Expression: (e.g., standing confidently with a slight smile, looking directly at the camera, pensive expression, dynamic pose as if walking)
    *   Age Appearance: (e.g., appears to be in their early 20s, mid-30s)
    *   Art Style (for person): (e.g., photorealistic portrait, character concept art, realistic digital painting)
    *   Lighting (on person): (e.g., soft even lighting on face, subtle Rembrandt lighting)

ルール:
*   おしゃれ好きとしてのリアルな視点、一般的なファッションのバランス感覚、トレンド感、清潔感、TPOを考慮。
*   服装、髪型、メイク（雰囲気）、アクセサリー、靴、バッグまでトータルでチェック。
*   Responseは日本語で、ただし「画像生成AI用プロンプト」と「人物フォーカス 画像生成AI用プロンプト」は英語で記述してください。
*   判断が難しい場合は「画像からは判断困難」またはそれに類する記述をしてください。

評価基準 (おしゃれな一般人・辛口版):
レベル５：最高！センス良すぎ！
レベル４：いいね！おしゃれ！
レベル３：普通かな…悪くはないけど…
レベル２：うーん…ちょっと残念かも
レベル１：これはナシ！どうにかした方が…

必ず以下のJSON形式で回答してください。JSONはマークダウンブロックで囲まず、生のJSONオブジェクトとして返してください。
{
  "rating": <1から5の整数評価 例: 4>,
  "evaluationStatement": "<評価レベルに対応する一言 例：レベル４：いいね！おしゃれ！>",
  "overallStyle": "<コーディネート全体のスタイルや印象を詳細に記述してください。>",
  "positivePoints": ["- <具体的な良い点1>", "- <具体的な良い点2>", "- <具体的な良い点3>"],
  "areasForImprovement": ["- <具体的な改善点1>", "- <具体的な改善点2>"],
  "improvementAdvice": ["- <具体的な改善アドバイス1>", "- <具体的な改善アドバイス2>"],
  "keyItems": [
    { "name": "<注目したアイテム名1>", "comment": "<そのアイテムに関する詳細なコメント>" }
  ],
  "personCharacteristics": {
    "hairStyle": "<髪型>",
    "hairColor": "<髪色>",
    "bodyShape": "<体型>",
    "estimatedHeight": "<身長の推定>",
    "skeletalDiagnosis": "<骨格診断のタイプ（推定）>"
  },
  "fashionItems": [
    { "category": "帽子", "name": "<名称>", "description": "<特徴>" },
    // 他のカテゴリも同様に記述。該当がなければそのカテゴリは省略。
  ],
  "imageGenerationPrompt": "<ここに画像生成AI用の英語プロンプトを記述。詳細かつ具体的にお願いします。カンマ区切りで多くのキーワードを。>",
  "personOnlyImageGenerationPrompt": "<ここに人物の特徴のみにフォーカスした画像生成AI用の英語プロンプトを記述。服装や背景は含めないでください。>"
}
`;

    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, 
        topP: 0.9,
        topK: 40,
      }
    });
    
    let jsonStr = response.text.trim();
    
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr) as FashionAnalysis;
      
      // --- Start of Validation ---
      if (
        typeof parsedData.rating !== 'number' ||
        parsedData.rating < 1 || parsedData.rating > 5 ||
        typeof parsedData.overallStyle !== 'string' || parsedData.overallStyle.trim().length < 10 ||
        typeof parsedData.evaluationStatement !== 'string' || parsedData.evaluationStatement.trim().length === 0 ||

        !Array.isArray(parsedData.positivePoints) ||
        (parsedData.positivePoints.length > 0 && parsedData.positivePoints.some(s => typeof s !== 'string' || s.trim().length < 5)) ||

        !Array.isArray(parsedData.areasForImprovement) ||
        (parsedData.areasForImprovement.length > 0 && parsedData.areasForImprovement.some(s => typeof s !== 'string' || s.trim().length < 5)) ||

        !Array.isArray(parsedData.improvementAdvice) ||
        (parsedData.improvementAdvice.length > 0 && parsedData.improvementAdvice.some(s => typeof s !== 'string' || s.trim().length < 5)) ||

        !Array.isArray(parsedData.keyItems) || 
        parsedData.keyItems.length === 0 
      ) {
        console.warn("AIレスポンスの基本フィールド検証エラー", parsedData);
        throw new Error("AIからのレスポンス形式が正しくありません。(基本フィールド)");
      }

      parsedData.keyItems.forEach((item: KeyFashionItem, index: number) => {
        if (typeof item.name !== 'string' || item.name.trim().length === 0 || 
            typeof item.comment !== 'string' || item.comment.trim().length < 10) {
          console.warn(`キーアイテム ${index} の形式が不正です。`, item);
          throw new Error(`AIからのレスポンス形式が正しくありません。キーアイテム ${index + 1} の名前またはコメントが不十分です。`);
        }
      });

      if (
        !parsedData.personCharacteristics || typeof parsedData.personCharacteristics !== 'object' ||
        typeof parsedData.personCharacteristics.hairStyle !== 'string' ||
        typeof parsedData.personCharacteristics.hairColor !== 'string' ||
        typeof parsedData.personCharacteristics.bodyShape !== 'string' ||
        typeof parsedData.personCharacteristics.estimatedHeight !== 'string' ||
        typeof parsedData.personCharacteristics.skeletalDiagnosis !== 'string'
      ) {
        console.warn("AIレスポンスの人物特徴フィールド検証エラー", parsedData.personCharacteristics);
        throw new Error("AIからのレスポンス形式が正しくありません。(人物特徴)");
      }

      if (!Array.isArray(parsedData.fashionItems)) {
        console.warn("AIレスポンスのファッションアイテムリスト検証エラー: 配列ではありません", parsedData.fashionItems);
        throw new Error("AIからのレスポンス形式が正しくありません。(ファッションアイテムリストは配列であるべきです)");
      }
      
      parsedData.fashionItems.forEach((item: FashionItemDetail, index: number) => {
        if (
          typeof item.category !== 'string' || item.category.trim().length === 0 ||
          typeof item.name !== 'string' || item.name.trim().length === 0 ||
          typeof item.description !== 'string'
        ) {
          console.warn(`ファッションアイテム ${index} の形式が不正です。`, item);
          throw new Error(`AIからのレスポンス形式が正しくありません。ファッションアイテム ${index + 1} のカテゴリ、名前、または説明が不十分です。`);
        }
      });

      if (typeof parsedData.imageGenerationPrompt !== 'string' || parsedData.imageGenerationPrompt.trim().length < 20) {
        console.warn("AIレスポンスの画像生成プロンプト検証エラー", parsedData.imageGenerationPrompt);
        throw new Error("AIからのレスポンス形式が正しくありません。(画像生成プロンプトが不十分です)");
      }
      
      if (typeof parsedData.personOnlyImageGenerationPrompt !== 'string' || parsedData.personOnlyImageGenerationPrompt.trim().length < 10) {
        console.warn("AIレスポンスの人物フォーカス画像生成プロンプト検証エラー", parsedData.personOnlyImageGenerationPrompt);
        throw new Error("AIからのレスポンス形式が正しくありません。(人物フォーカス画像生成プロンプトが不十分です)");
      }
      // --- End of Validation ---

      return parsedData;
    } catch (e) {
      console.error("JSON解析エラー:", e, "元の文字列:", jsonStr);
      throw new Error("AIからのレスポンスを解析できませんでした。AIの出力が期待されるJSON形式と異なる可能性があります。");
    }

  } catch (error) {
    console.error("Gemini APIエラー:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key not valid")) {
         throw new Error("APIキーが無効です。正しいAPIキーが設定されているか確認してください。");
      }
      throw new Error(`AI分析サービスとの通信に失敗しました: ${error.message}`);
    }
    throw new Error("AI分析サービスとの通信中に不明なエラーが発生しました。");
  }
};