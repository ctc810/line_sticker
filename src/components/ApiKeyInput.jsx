import React from 'react';


const ApiKeyInput = ({ apiKey, setApiKey }) => {
    return (
        <div className="step-section">
            <h2>步驟 1: 填入 Gemini API Key</h2>
            <div className="form-group">
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="請輸入您的 Gemini API Key"
                    className="form-input"
                />
                <p className="form-hint">
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                        取得 Gemini API Key
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ApiKeyInput;
