import React from 'react';
import { STEPS } from '../utils/constants';

const StepNavigator = ({ currentStep }) => {
    const steps = [
        { id: STEPS.API_KEY, label: 'API Key' },
        { id: STEPS.COUNT_SELECTION, label: '張數' },
        { id: STEPS.CHARACTER_INPUT, label: '角色' },
        { id: STEPS.CHARACTER_GENERATION, label: '生成' },
        { id: STEPS.TEXT_STYLE, label: '風格' },
        { id: STEPS.TEXT_DESCRIPTION, label: '描述' },
        { id: STEPS.STICKER_GENERATION, label: '製作' },
        { id: STEPS.FINAL_ADJUSTMENT, label: '調整' },
        { id: STEPS.DOWNLOAD, label: '下載' },
    ];

    return (
        <div className="step-navigator">
            {steps.map((step) => (
                <div
                    key={step.id}
                    className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''
                        }`}
                >
                    <div className="step-number">{step.id}</div>
                    <div className="step-label">{step.label}</div>
                </div>
            ))}
        </div>
    );
};

export default StepNavigator;
