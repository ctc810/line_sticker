import React from 'react';
import { removeBackgroundSimple } from '../utils/imageUtils';

const StickerGrid = ({
    gridImages,
    processedGridImages,
    setProcessedGridImages,
    backgroundThreshold,
    setBackgroundThreshold,
    processingBackground,
    setProcessingBackground,
    previewBackgroundDark,
    setPreviewBackgroundDark,
    onNext
}) => {

    const handleApplyBackgroundRemoval = async () => {
        setProcessingBackground(true);

        try {
            const newProcessed = [];
            for (let i = 0; i < gridImages.length; i++) {
                const processed = await removeBackgroundSimple(gridImages[i], backgroundThreshold, null);
                newProcessed.push(processed);
            }
            setProcessedGridImages(newProcessed);
        } catch (error) {
            console.error('去背處理失敗:', error);
            // You might want to pass an onError prop to handle this
        } finally {
            setProcessingBackground(false);
        }
    };

    if (!processedGridImages || processedGridImages.length === 0) return null;

    return (
        <div className="step-section">
            <h2>步驟 7: 調整去背程度</h2>
            <div className="form-group">
                <label>去背閾值（數值越小，去背越強；數值越大，保留越多背景）</label>
                <div className="threshold-control">
                    <input
                        type="range"
                        min="200"
                        max="255"
                        value={backgroundThreshold}
                        onChange={async (e) => {
                            const newThreshold = Number(e.target.value);
                            setBackgroundThreshold(newThreshold);
                            // 實時應用去背調整
                            setProcessingBackground(true);
                            try {
                                const newProcessed = [];
                                for (let i = 0; i < gridImages.length; i++) {
                                    const processed = await removeBackgroundSimple(gridImages[i], newThreshold, null);
                                    newProcessed.push(processed);
                                }
                                setProcessedGridImages(newProcessed);
                            } catch (error) {
                                console.error('去背處理失敗:', error);
                            } finally {
                                setProcessingBackground(false);
                            }
                        }}
                        className="threshold-slider"
                    />
                    <span className="threshold-value">{backgroundThreshold}</span>
                </div>
                <p className="threshold-hint">
                    當前值：{backgroundThreshold}（建議範圍：200-255，預設：240）- 調整滑桿會即時預覽效果
                </p>
            </div>

            <button
                className="btn btn-primary"
                onClick={handleApplyBackgroundRemoval}
                disabled={processingBackground}
            >
                {processingBackground ? '處理中...' : '應用去背調整'}
            </button>

            <div className="preview-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0 }}>去背後預覽（{processedGridImages.length} 張8宮格）</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>切換背景：</span>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setPreviewBackgroundDark(!previewBackgroundDark)}
                            style={{
                                fontSize: '14px',
                                padding: '8px 16px',
                                width: 'auto',
                                minWidth: '140px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                backgroundColor: previewBackgroundDark ? '#2d2d2d' : '#f0f0f0',
                                color: previewBackgroundDark ? '#fff' : '#333',
                                border: previewBackgroundDark ? '2px solid #555' : '2px solid #ddd',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{previewBackgroundDark ? '🌙' : '☀️'}</span>
                            <span>{previewBackgroundDark ? '深色背景' : '淺色背景'}</span>
                        </button>
                        <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                            {previewBackgroundDark ? '（模擬 LINE 深色模式）' : '（模擬 LINE 淺色模式）'}
                        </span>
                    </div>
                </div>

                {processedGridImages.map((img, index) => (
                    <div key={index} className="grid-preview-item" style={{ marginBottom: '30px' }}>
                        <h4>第 {index + 1} 張 8宮格 (去背後)</h4>
                        <div className={`image-preview-container ${previewBackgroundDark ? 'dark-bg' : 'light-bg'}`}>
                            <img
                                src={img}
                                alt={`Grid ${index + 1} processed`}
                                className="grid-image-preview"
                            />
                        </div>

                        {/* 也可以顯示原圖對比 */}
                        <div style={{ marginTop: '10px' }}>
                            <details>
                                <summary style={{ cursor: 'pointer', color: '#666', fontSize: '14px' }}>查看原圖（去背前）</summary>
                                <div style={{ marginTop: '10px', border: '1px solid #ddd', padding: '5px' }}>
                                    <img src={gridImages[index]} alt={`Grid ${index + 1} original`} style={{ maxWidth: '100%', height: 'auto' }} />
                                </div>
                            </details>
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button className="btn btn-success btn-large" onClick={onNext}>
                        下一步：裁切並生成主要/標籤圖片
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StickerGrid;
