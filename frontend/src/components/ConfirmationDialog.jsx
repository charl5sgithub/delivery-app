import React from 'react';

const ConfirmationDialog = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isAlert = false
}) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)'
        }} onClick={isAlert ? onConfirm : onCancel}>
            <div style={{
                backgroundColor: 'var(--white)',
                padding: '2rem',
                borderRadius: '1rem',
                maxWidth: '400px',
                width: '90%',
                boxShadow: 'var(--shadow-lg)',
                animation: 'slideIn 0.2s ease-out'
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{
                    marginTop: 0,
                    marginBottom: '1rem',
                    color: 'var(--text-color)',
                    fontSize: '1.25rem',
                    fontWeight: 600
                }}>
                    {title}
                </h3>
                <p style={{
                    marginBottom: '1.5rem',
                    color: '#4b5563',
                    lineHeight: 1.6
                }}>
                    {message}
                </p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}>
                    {!isAlert && (
                        <button
                            onClick={onCancel}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                backgroundColor: 'white',
                                color: '#374151',
                                cursor: 'pointer',
                                fontWeight: 500,
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={e => e.target.style.backgroundColor = '#f9fafb'}
                            onMouseOut={e => e.target.style.backgroundColor = 'white'}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '0.5rem',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 500,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = 'var(--primary-dark)'}
                        onMouseOut={e => e.target.style.backgroundColor = 'var(--primary-color)'}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>
                {`
                    @keyframes slideIn {
                        from { transform: translateY(10px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default ConfirmationDialog;
