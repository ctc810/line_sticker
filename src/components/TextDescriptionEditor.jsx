import React from 'react';
import { generateTextStyle, generateImageDescriptionsWithText } from '../utils/gemini';

const TextDescriptionEditor = ({
    apiKey,
    theme,
    count,
    characterDescription,
    textStyle,
    setTextStyle,
    textStyleConfirmed,
    setTextStyleConfirmed,
    generatingTextStyle,
    setGeneratingTextStyle,
    descriptions,
    setDescriptions,
    generatingDescriptions,
    setGeneratingDescriptions,
    excludedTexts,
    setExcludedTexts,
    characterStance,
    setCharacterStance,
    setProgress,
    onNext,
    onError
}) => {

    const handleGenerateTextStyle = async () => {
        if (!apiKey.trim()) {
            onError('請輸入 Gemini API Key');
            return;
        }
        if (!theme.trim()) {
            onError('請輸入主題說明');
            return;
        }

        setGeneratingTextStyle(true);
        setProgress('正在生成文字風格描述...');

        try {
            const style = await generateTextStyle(apiKey, theme, characterDescription);
            setTextStyle(style);
            setTextStyleConfirmed(true);
            setProgress('文字風格描述生成完成，可以編輯後繼續');
        } catch (error) {
            console.error('生成文字風格失敗:', error);
            onError(`生成文字風格失敗: ${error.message}`);
            setProgress('');
        } finally {
            setGeneratingTextStyle(false);
        }
    };

    const handleGenerateDescriptions = async () => {
        if (!apiKey.trim()) {
            onError('請輸入 Gemini API Key');
            return;
        }
        if (!theme.trim()) {
            onError('請輸入主題說明');
            return;
        }

        setGeneratingDescriptions(true);

        // 如果沒有文字風格描述，先自動生成
        let finalTextStyle = textStyle;
        if (!textStyle.trim()) {
            setProgress('正在自動生成文字風格描述...');
            try {
                finalTextStyle = await generateTextStyle(apiKey, theme, characterDescription);
                setTextStyle(finalTextStyle);
                setProgress('文字風格已自動生成，正在生成文字描述...');
            } catch (error) {
                console.error('自動生成文字風格失敗:', error);
                finalTextStyle = '可愛簡潔的風格，文字清晰易讀，使用明亮的文字框背景';
                setTextStyle(finalTextStyle);
                setProgress('使用預設文字風格，正在生成文字描述...');
            }
        } else {
            setProgress('正在生成文字描述...');
        }

        try {
            const excludedTextList = excludedTexts
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const items = await generateImageDescriptionsWithText(
                apiKey,
                theme,
                finalTextStyle,
                count,
                excludedTextList,
                characterStance.trim()
            );
            setDescriptions(items);
            setProgress('文字描述生成完成，可以編輯後繼續');
        } catch (error) {
            console.error('生成描述失敗:', error);
            const errorMessage = error.message || error.toString() || '未知錯誤';
            if (errorMessage.includes('overloaded') || errorMessage.includes('overload') || errorMessage.includes('503')) {
                onError(`生成描述失敗：API 服務器過載\n建議：等待幾秒後再試`);
            } else {
                onError(`生成描述失敗: ${errorMessage}`);
            }
            setProgress('');
        } finally {
            setGeneratingDescriptions(false);
        }
    };

    const handleUpdateDescription = (index, field, value) => {
        const newDescriptions = [...descriptions];
        newDescriptions[index][field] = value;
        setDescriptions(newDescriptions);
    };

    return (
        <>
            <div className="step-section">
                <h2>步驟 5: 字體樣式風格描述</h2>
                <div className="form-group">
                    <label>字體樣式風格描述（可選，不填寫則在生成文字描述時自動由 AI 生成）</label>
                    <textarea
                        value={textStyle}
                        onChange={(e) => setTextStyle(e.target.value)}
                        placeholder="例如：可愛簡潔的風格，文字清晰易讀，使用粗體字，文字框使用白色或黃色背景..."
                        rows={3}
                        className="form-input"
                        disabled={generatingTextStyle}
                    />
                    <p className="form-hint">如果不填寫，系統會在生成文字描述時自動生成統一的字體樣式風格</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleGenerateTextStyle}
                    disabled={generatingTextStyle || !apiKey || !theme.trim()}
                >
                    {generatingTextStyle ? '生成中...' : textStyle ? '重新生成字體樣式風格' : '預覽 AI 生成的字體樣式風格'}
                </button>

                {textStyle && (
                    <div className="text-style-preview">
                        <h3>字體樣式風格：</h3>
                        <p className="text-style-content">{textStyle}</p>
                        <button className="btn btn-success" onClick={() => setTextStyleConfirmed(true)}>
                            確認，繼續下一步
                        </button>
                    </div>
                )}

                {!textStyle && (
                    <div className="info-box">
                        <p>💡 提示：如果現在不填寫文字風格，系統會在生成文字描述時自動生成統一的字體樣式風格，確保所有貼圖的文字樣式一致。</p>
                        <button className="btn btn-success" onClick={() => setTextStyleConfirmed(true)}>
                            跳過，直接進入下一步（將自動生成字體樣式風格）
                        </button>
                    </div>
                )}
            </div>

            {textStyleConfirmed && (
                <div className="step-section">
                    <h2>步驟 6: 生成文字描述（可編輯）</h2>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="characterStance" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            角色立場描述（選填）：
                        </label>
                        <textarea
                            id="characterStance"
                            value={characterStance}
                            onChange={(e) => setCharacterStance(e.target.value)}
                            placeholder="例如：攀岩時非常厭世、語氣消極、愛吐槽"
                            className="form-input"
                            style={{ width: '100%', minHeight: '80px', padding: '10px' }}
                        />
                        <p style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                            💡 提示：描述角色立場或語氣，會影響文字生成風格與用詞方向。
                        </p>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="excludedTexts" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            排除這些文字（選填，每行一個）：
                        </label>
                        <textarea
                            id="excludedTexts"
                            value={excludedTexts}
                            onChange={(e) => setExcludedTexts(e.target.value)}
                            placeholder="例如：&#10;你好&#10;謝謝&#10;再見"
                            className="form-input"
                            style={{ width: '100%', minHeight: '100px', padding: '10px' }}
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateDescriptions}
                        disabled={generatingDescriptions || !apiKey}
                    >
                        {generatingDescriptions ? '生成中...' : textStyle ? '生成文字描述' : '生成文字描述（將自動生成字體樣式風格）'}
                    </button>

                    {descriptions.length > 0 && (
                        <div className="descriptions-editor">
                            <h3>編輯描述和文字（共 {descriptions.length} 張）</h3>
                            {descriptions.map((item, index) => (
                                <div key={index} className="description-item">
                                    <div className="description-field">
                                        <label>描述 {index + 1}:</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleUpdateDescription(index, 'description', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="description-field">
                                        <label>文字 {index + 1}:</label>
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(e) => handleUpdateDescription(index, 'text', e.target.value)}
                                            className="form-input"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-primary" onClick={onNext}>
                                開始生成8宮格貼圖
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default TextDescriptionEditor;
