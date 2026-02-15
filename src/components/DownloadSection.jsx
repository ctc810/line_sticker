import React, { useState } from 'react';
import { downloadAsZip } from '../utils/zipDownloader';

const DownloadSection = ({
    cutImages,
    mainImage,
    tabImage,
    descriptions,
    theme,
    onError
}) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (cutImages.length === 0) {
            onError('請先生成貼圖');
            return;
        }

        setDownloading(true);
        try {
            // 將裁切後的圖片轉換為下載格式
            const imagesForDownload = cutImages.map((dataUrl, index) => ({
                index: index + 1,
                description: descriptions[index]?.description || `貼圖 ${index + 1}`,
                dataUrl: dataUrl
            }));

            await downloadAsZip(imagesForDownload, mainImage, tabImage, theme);
        } catch (error) {
            console.error('下載失敗:', error);
            onError(`下載失敗: ${error.message}`);
        } finally {
            setDownloading(false);
        }
    };

    if (!mainImage || !tabImage || cutImages.length === 0) return null;

    return (
        <div className="step-section">
            <h2>步驟 8: 預覽與下載</h2>

            <div className="final-preview">
                <div className="main-tab-preview">
                    <div className="preview-item">
                        <h3>主要圖片 (Main)</h3>
                        <p>240x240</p>
                        <img src={mainImage} alt="Main Image" style={{ width: '240px', height: '240px', border: '1px solid #ddd' }} />
                    </div>
                    <div className="preview-item">
                        <h3>標籤圖片 (Tab)</h3>
                        <p>96x74</p>
                        <img src={tabImage} alt="Tab Image" style={{ width: '96px', height: '74px', border: '1px solid #ddd' }} />
                    </div>
                </div>

                <h3>貼圖預覽 (共 {cutImages.length} 張)</h3>
                <div className="stickers-grid">
                    {cutImages.map((img, index) => (
                        <div key={index} className="sticker-item">
                            <img src={img} alt={`Sticker ${index + 1}`} />
                            <div className="sticker-number">{index + 1}</div>
                            <p className="sticker-text">{descriptions[index]?.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="actions" style={{ marginTop: '30px', textAlign: 'center' }}>
                <button
                    className="btn btn-primary btn-large"
                    onClick={handleDownload}
                    disabled={downloading}
                    style={{ fontSize: '1.2em', padding: '15px 30px' }}
                >
                    {downloading ? '正在打包下載...' : '📦 打包下載 ZIP 檔案'}
                </button>
                <p style={{ marginTop: '10px', color: '#666' }}>
                    包含：所有裁切好的貼圖、主要圖片、標籤圖片（符合 LINE 上架規範）
                </p>
            </div>
        </div>
    );
};

export default DownloadSection;
