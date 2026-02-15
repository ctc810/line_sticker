import { useState } from 'react';
import { STEPS } from '../utils/constants';

// Correct imports based on file analysis
import {
    generateCharacter,
    generateMainImage,
    generateTabImage,
    generateGrid8Image
} from '../utils/characterGenerator';

import {
    removeBackgroundSimple,
    splitGrid8
} from '../utils/imageUtils';

export const useStickerMaker = () => {
    // Step 1: API Key
    const [apiKey, setApiKey] = useState('');

    // Step 2: Count
    const [count, setCount] = useState(8);

    // Step 3: Character & Theme
    const [characterDescription, setCharacterDescription] = useState('');
    const [theme, setTheme] = useState('');
    const [uploadedCharacterImage, setUploadedCharacterImage] = useState(null);

    // Step 4: Character Generation
    const [characterImage, setCharacterImage] = useState(null);
    const [characterConfirmed, setCharacterConfirmed] = useState(false);
    const [generatingCharacter, setGeneratingCharacter] = useState(false);

    // Step 5: Text Style
    const [textStyle, setTextStyle] = useState('');
    const [generatingTextStyle, setGeneratingTextStyle] = useState(false);
    const [textStyleConfirmed, setTextStyleConfirmed] = useState(false);

    // Step 6: Descriptions
    const [descriptions, setDescriptions] = useState([]);
    const [generatingDescriptions, setGeneratingDescriptions] = useState(false);
    const [excludedTexts, setExcludedTexts] = useState('');
    const [characterStance, setCharacterStance] = useState('');

    // Step 7-9: Generation & Processing
    const [gridImages, setGridImages] = useState([]);
    const [processedGridImages, setProcessedGridImages] = useState([]);
    const [cutImages, setCutImages] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [tabImage, setTabImage] = useState(null);
    const [backgroundThreshold, setBackgroundThreshold] = useState(240);
    const [processingBackground, setProcessingBackground] = useState(false);
    const [previewBackgroundDark, setPreviewBackgroundDark] = useState(false);

    // UI State
    const [currentStep, setCurrentStep] = useState(STEPS.API_KEY);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const [progressPercent, setProgressPercent] = useState(0); // 0-100
    const [error, setError] = useState(null);

    const handleError = (msg) => {
        setError(msg);
    };

    const clearError = () => {
        setError(null);
    };

    // Complex Logic for Sticker Generation (Step 6 -> 7)
    const handleGenerateStickers = async () => {
        if (!characterImage) {
            handleError('請先生成或上傳角色圖片');
            return;
        }
        if (descriptions.length === 0) {
            handleError('請先生成文字描述');
            return;
        }

        // Check for duplicates
        const textSet = new Set();
        const duplicateTexts = [];
        for (let i = 0; i < descriptions.length; i++) {
            const text = descriptions[i].text?.trim();
            if (!text) {
                handleError(`第 ${i + 1} 張貼圖的文字為空，請填寫`);
                return;
            }
            if (textSet.has(text)) {
                duplicateTexts.push({ index: i + 1, text });
            } else {
                textSet.add(text);
            }
        }

        if (duplicateTexts.length > 0) {
            const duplicateList = duplicateTexts.map(d => `第 ${d.index} 張: "${d.text}"`).join('\n');
            handleError(`發現重複的文字，請修改後再生成：\n${duplicateList}`);
            return;
        }

        setLoading(true);
        setProgress('開始生成貼圖...');
        setProgressPercent(0);

        try {
            const gridCount = Math.ceil(count / 8);
            const allGridImages = [];

            for (let gridIndex = 0; gridIndex < gridCount; gridIndex++) {
                if (gridIndex > 0) {
                    const delay = 3000;
                    setProgress(`等待 ${delay / 1000} 秒後生成下一張8宮格（避免 API 過載）...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                setProgress(`正在生成第 ${gridIndex + 1}/${gridCount} 張8宮格圖片...`);
                // Progress: 0-60% for generation
                setProgressPercent(Math.round((gridIndex / gridCount) * 60));

                const startIndex = gridIndex * 8;
                const endIndex = Math.min(startIndex + 8, count);
                const gridStickers = [];

                for (let i = startIndex; i < endIndex; i++) {
                    gridStickers.push(descriptions[i]);
                }

                while (gridStickers.length < 8) {
                    gridStickers.push({ description: '空白貼圖', text: '' });
                }

                let gridImage = null;
                let retryCount = 0;
                const maxRetries = 5;

                while (!gridImage && retryCount < maxRetries) {
                    try {
                        gridImage = await generateGrid8Image(
                            apiKey,
                            characterImage,
                            gridStickers,
                            textStyle || ''
                        );
                    } catch (error) {
                        retryCount++;
                        if (retryCount < maxRetries) {
                            const isOverloaded = error.message && (
                                error.message.includes('overloaded') ||
                                error.message.includes('overload') ||
                                error.message.includes('請稍後再試')
                            );

                            const baseDelay = isOverloaded ? 10000 : 5000;
                            const delay = baseDelay * Math.pow(2, retryCount - 1);

                            console.warn(`生成8宮格失敗，重試中 (${retryCount}/${maxRetries})...`, error.message);
                            setProgress(`生成8宮格失敗，正在重試 (${retryCount}/${maxRetries})，等待 ${Math.round(delay / 1000)} 秒...`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                        } else {
                            throw new Error(`生成第 ${gridIndex + 1} 張8宮格失敗（已重試 ${maxRetries} 次）: ${error.message}`);
                        }
                    }
                }

                if (gridImage) {
                    allGridImages.push(gridImage);
                }
            }

            setGridImages(allGridImages);

            // Auto background removal
            setProgress('正在進行自動去背...');
            const initialProcessed = [];
            for (let i = 0; i < allGridImages.length; i++) {
                setProgress(`正在為第 ${i + 1}/${allGridImages.length} 張8宮格去背...`);
                // Progress: 60-100% for background removal
                setProgressPercent(60 + Math.round(((i + 1) / allGridImages.length) * 40));
                const processed = await removeBackgroundSimple(allGridImages[i], backgroundThreshold, null);
                initialProcessed.push(processed);
            }
            setProcessedGridImages(initialProcessed);
            setCurrentStep(STEPS.STICKER_GENERATION); // This matches step 7 in original
            setProgress('去背完成，請調整去背程度後點擊「下一步」進行裁切');
            setProgressPercent(100);

        } catch (error) {
            console.error('生成失敗:', error);
            handleError(`生成失敗: ${error.message}`);
            setProgress('');
        } finally {
            setLoading(false);
        }
    };

    // Complex Logic for Splitting and Final Generation (Step 7 -> 8)
    const handleSplitGrids = async () => {
        if (processedGridImages.length === 0) {
            handleError('請先完成去背');
            return;
        }

        setLoading(true);
        setProgress('正在裁切8宮格...');
        setProgressPercent(0);

        try {
            const allCutImages = [];
            const gridCount = processedGridImages.length;

            for (let gridIndex = 0; gridIndex < gridCount; gridIndex++) {
                setProgress(`正在裁切第 ${gridIndex + 1}/${gridCount} 張8宮格...`);
                // Progress: 0-50% for splitting
                setProgressPercent(Math.round(((gridIndex + 1) / gridCount) * 50));
                const cutCells = await splitGrid8(processedGridImages[gridIndex], 370, 320);

                const startIndex = gridIndex * 8;
                const endIndex = Math.min(startIndex + 8, count);
                const actualCutCount = endIndex - startIndex;

                allCutImages.push(...cutCells.slice(0, actualCutCount));
            }

            setCutImages(allCutImages);
            setProgress('裁切完成！正在生成主要圖片和標籤圖片...');
            setProgressPercent(60);

            // Main Image
            setProgress('正在生成主要圖片（240×240，無文字）...');
            const mainImg = await generateMainImage(apiKey, characterImage, theme);
            const mainImgProcessed = await removeBackgroundSimple(mainImg, backgroundThreshold);
            setMainImage(mainImgProcessed);
            setProgressPercent(80);

            // Tab Image
            setProgress('正在生成標籤圖片（96×74，無文字）...');
            const tabImg = await generateTabImage(apiKey, characterImage, theme);
            const tabImgProcessed = await removeBackgroundSimple(tabImg, backgroundThreshold);
            setTabImage(tabImgProcessed);
            setProgressPercent(100);

            setCurrentStep(STEPS.DOWNLOAD); // This matches step 9
            setProgress('完成！所有貼圖已生成，可以下載了');
        } catch (error) {
            console.error('處理失敗:', error);
            handleError(`處理失敗: ${error.message}`);
            setProgress('');
        } finally {
            setLoading(false);
        }
    };

    return {
        state: {
            apiKey, count, characterDescription, theme, uploadedCharacterImage,
            characterImage, characterConfirmed, generatingCharacter,
            textStyle, generatingTextStyle, textStyleConfirmed,
            descriptions, generatingDescriptions, excludedTexts, characterStance,
            gridImages, processedGridImages, cutImages, mainImage, tabImage,
            backgroundThreshold, processingBackground, previewBackgroundDark,
            currentStep, loading, progress, progressPercent, error
        },
        actions: {
            setApiKey, setCount, setCharacterDescription, setTheme, setUploadedCharacterImage,
            setCharacterImage, setCharacterConfirmed, setGeneratingCharacter,
            setTextStyle, setGeneratingTextStyle, setTextStyleConfirmed,
            setDescriptions, setGeneratingDescriptions, setExcludedTexts, setCharacterStance,
            setGridImages, setProcessedGridImages, setCutImages, setMainImage, setTabImage,
            setBackgroundThreshold, setProcessingBackground, setPreviewBackgroundDark,
            setCurrentStep, setLoading, setProgress, setProgressPercent, setError, handleError, clearError,
            handleGenerateStickers, handleSplitGrids
        }
    };
};
