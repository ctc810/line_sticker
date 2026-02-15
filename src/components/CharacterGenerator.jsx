import React from 'react';
import { generateCharacter } from '../utils/characterGenerator';
import { fileToDataURL } from '../utils/imageUtils';

const CharacterGenerator = ({
    apiKey,
    theme,
    setTheme,
    characterDescription,
    setCharacterDescription,
    uploadedCharacterImage,
    setUploadedCharacterImage,
    characterImage,
    setCharacterImage,
    characterConfirmed,
    setCharacterConfirmed,
    generatingCharacter,
    setGeneratingCharacter,
    setProgress,
    onNext,
    onError
}) => {

    const handleCharacterUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const dataUrl = await fileToDataURL(file);
                setUploadedCharacterImage(dataUrl);
                setCharacterImage(dataUrl);
                setCharacterConfirmed(true);
            } catch (error) {
                onError('圖片上傳失敗');
            }
        }
    };

    const handleGenerateCharacter = async () => {
        if (!apiKey.trim()) {
            onError('請輸入 Gemini API Key');
            return;
        }
        if (!characterDescription.trim() && !uploadedCharacterImage) {
            onError('請輸入角色描述或上傳角色圖片');
            return;
        }

        setGeneratingCharacter(true);
        setProgress('正在生成角色圖片...');

        try {
            const character = await generateCharacter(apiKey, characterDescription || theme, uploadedCharacterImage);
            setCharacterImage(character);
            setCharacterConfirmed(false);
            setProgress('角色生成完成，請確認是否符合要求');
        } catch (error) {
            console.error('生成角色失敗:', error);
            onError(`生成角色失敗: ${error.message}`);
            setProgress('');
        } finally {
            setGeneratingCharacter(false);
        }
    };

    const handleRegenerateCharacter = () => {
        setCharacterImage(null);
        setCharacterConfirmed(false);
    };

    return (
        <div className="step-section">
            <h2>步驟 3: 填入角色描述或上傳角色圖片</h2>
            <div className="form-group">
                <label>角色描述（如果不上傳圖片，則根據描述生成角色）</label>
                <textarea
                    value={characterDescription}
                    onChange={(e) => setCharacterDescription(e.target.value)}
                    placeholder="請描述角色的外觀、特徵、風格等..."
                    rows={3}
                    className="form-input"
                    disabled={!!uploadedCharacterImage}
                />
            </div>
            <div className="form-group">
                <label>或上傳角色圖片（如果上傳，將使用此圖片作為角色）</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleCharacterUpload}
                    className="form-input"
                />
                {uploadedCharacterImage && (
                    <div>
                        <img src={uploadedCharacterImage} alt="上傳的角色" className="preview-image-small" />
                        <p className="success-message">✓ 已上傳角色圖片，將在步驟 4 自動顯示</p>
                    </div>
                )}
            </div>
            <div className="form-group">
                <label>主題說明</label>
                <textarea
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="請描述貼圖的主題、情境、用途等..."
                    rows={3}
                    className="form-input"
                />
            </div>

            <h2>步驟 4: 角色確認</h2>

            {/* 如果已上傳角色圖片，直接顯示 */}
            {uploadedCharacterImage && characterImage && (
                <div className="character-preview">
                    <h3>上傳的角色圖片</h3>
                    <img src={characterImage} alt="上傳的角色" className="preview-image character-image" />
                    <p className="success-message">✓ 已使用上傳的角色圖片</p>
                    <button className="btn btn-success" onClick={() => setCharacterConfirmed(true)}>
                        確認，繼續下一步
                    </button>
                </div>
            )}

            {/* 如果沒有上傳，則生成角色 */}
            {!uploadedCharacterImage && (
                <>
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateCharacter}
                        disabled={generatingCharacter || !apiKey || (!characterDescription.trim() && !theme.trim())}
                    >
                        {generatingCharacter ? '生成中...' : '生成角色'}
                    </button>

                    {characterImage && (
                        <div className="character-preview">
                            <h3>角色預覽（請確認是否符合要求）</h3>
                            <img src={characterImage} alt="生成的角色" className="preview-image character-image" />
                            {!characterConfirmed ? (
                                <div className="character-actions">
                                    <button className="btn btn-success" onClick={() => setCharacterConfirmed(true)}>
                                        確認，繼續下一步
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleRegenerateCharacter}>
                                        重新生成
                                    </button>
                                </div>
                            ) : (
                                <p className="success-message">✓ 角色已確認</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CharacterGenerator;
