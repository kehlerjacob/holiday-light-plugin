import React, { useRef, useState } from 'react';
import { X, Trash2 } from 'lucide-react';

const PreviewCanvas = ({ image, selectedLight, onReset }) => {
    const [lights, setLights] = useState([]);
    const containerRef = useRef(null);

    const handleImageClick = (e) => {
        if (!containerRef.current || !selectedLight) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setLights([...lights, { x, y, type: selectedLight }]);
    };

    const clearLights = (e) => {
        e.stopPropagation();
        setLights([]);
    };

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#0f172a',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '1px solid #1e293b'
            }}
        >
            {/* Action Buttons - Top Right */}
            <div
                style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    zIndex: 20,
                    display: 'flex',
                    gap: '0.5rem'
                }}
            >
                <button
                    onClick={clearLights}
                    style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'}
                    title="Clear all lights"
                >
                    <Trash2 size={18} />
                </button>
                <button
                    onClick={onReset}
                    style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.9)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'}
                    title="Upload new photo"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Image Container */}
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    cursor: 'crosshair'
                }}
                onClick={handleImageClick}
            >
                <img
                    src={image}
                    alt="Home Preview"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        maxHeight: '70vh',
                        display: 'block'
                    }}
                />

                {/* Instructions Overlay */}
                {lights.length === 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(4px)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '9999px',
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.875rem'
                            }}
                        >
                            Click anywhere to place lights
                        </div>
                    </div>
                )}

                {/* Render Lights */}
                {lights.map((light, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: `${light.x}%`,
                            top: `${light.y}%`,
                            width: '1rem',
                            height: '1rem',
                            borderRadius: '9999px',
                            transform: 'translate(-50%, -50%)',
                            background: light.type.color,
                            boxShadow: `0 0 15px 2px ${light.type.glow}, 0 0 30px 5px ${light.type.glow}`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default PreviewCanvas;
