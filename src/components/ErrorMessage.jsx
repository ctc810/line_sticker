import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="error-message-container">
            <div className="error-message">
                <span>{message}</span>
                {onClose && (
                    <button className="error-close-btn" onClick={onClose}>
                        &times;
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
