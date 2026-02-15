import React from 'react';

const ProgressBar = ({ progress, total }) => {
    const percentage = Math.min(100, Math.max(0, (progress / total) * 100));

    return (
        <div className="progress-bar-container" style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', height: '10px', margin: '10px 0' }}>
            <div
                className="progress-bar-fill"
                style={{
                    width: `${percentage}%`,
                    backgroundColor: '#4caf50',
                    height: '100%',
                    borderRadius: '5px',
                    transition: 'width 0.3s ease-in-out'
                }}
            />
        </div>
    );
};

export default ProgressBar;
