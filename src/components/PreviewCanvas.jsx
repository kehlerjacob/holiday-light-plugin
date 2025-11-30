import React, { useRef, useState } from 'react';

const PreviewCanvas = ({ image, selectedLight, onReset }) => {
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showLights, setShowLights] = useState(false);
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    const getCoordinates = (e) => {
        if (!containerRef.current) return null;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        return { x, y };
    };

    const handleMouseDown = (e) => {
        if (showLights) return; // Don't draw if lights are showing
        setIsDrawing(true);
        const coords = getCoordinates(e);
        if (coords) {
            setCurrentLine([coords]);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || showLights) return;
        const coords = getCoordinates(e);
        if (coords) {
            setCurrentLine([...currentLine, coords]);
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentLine.length > 1) {
            setLines([...lines, currentLine]);
        }
        setCurrentLine([]);
    };

    const clearLines = () => {
        setLines([]);
        setCurrentLine([]);
        setShowLights(false);
    };

    const previewDesign = () => {
        if (lines.length === 0) return;
        setShowLights(true);
    };

    const editDesign = () => {
        setShowLights(false);
    };

    // Generate light positions along all lines
    const generateLights = () => {
        if (!selectedLight) return [];
        const lights = [];
        const spacing = 3; // Spacing between lights in percentage

        lines.forEach(line => {
            for (let i = 0; i < line.length - 1; i++) {
                const start = line[i];
                const end = line[i + 1];
                const distance = Math.sqrt(
                    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
                );
                const numLights = Math.floor(distance / spacing);

                for (let j = 0; j <= numLights; j++) {
                    const t = j / numLights;
                    lights.push({
                        x: start.x + (end.x - start.x) * t,
                        y: start.y + (end.y - start.y) * t,
                        type: selectedLight
                    });
                }
            }
        });
        return lights;
    };

    const lightsToRender = showLights ? generateLights() : [];

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
                    onClick={clearLines}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)'}
                >
                    Clear All
                </button>
                <button
                    onClick={onReset}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.9)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)'}
                >
                    New Photo
                </button>
            </div>

            {/* Image Container */}
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    cursor: showLights ? 'default' : 'crosshair'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
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

                {/* SVG Canvas for Drawing Lines */}
                <svg
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                    }}
                >
                    {/* Draw completed lines */}
                    {!showLights && lines.map((line, lineIndex) => (
                        <polyline
                            key={lineIndex}
                            points={line.map(p => `${p.x}%,${p.y}%`).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.8"
                        />
                    ))}

                    {/* Draw current line being drawn */}
                    {!showLights && currentLine.length > 0 && (
                        <polyline
                            points={currentLine.map(p => `${p.x}%,${p.y}%`).join(' ')}
                            fill="none"
                            stroke="#60a5fa"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.6"
                        />
                    )}
                </svg>

                {/* Instructions Overlay */}
                {!showLights && lines.length === 0 && currentLine.length === 0 && (
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
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(4px)',
                                padding: '1rem 2rem',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                textAlign: 'center'
                            }}
                        >
                            Draw lines where you want lights
                        </div>
                    </div>
                )}

                {/* Render Lights */}
                {showLights && lightsToRender.map((light, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: `${light.x}%`,
                            top: `${light.y}%`,
                            width: '0.75rem',
                            height: '0.75rem',
                            borderRadius: '9999px',
                            transform: 'translate(-50%, -50%)',
                            background: light.type.color,
                            boxShadow: `0 0 12px 2px ${light.type.glow}, 0 0 24px 4px ${light.type.glow}`
                        }}
                    />
                ))}
            </div>

            {/* Preview/Edit Button */}
            {lines.length > 0 && (
                <div
                    style={{
                        padding: '1rem',
                        borderTop: '1px solid #1e293b',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    {!showLights ? (
                        <button
                            onClick={previewDesign}
                            disabled={!selectedLight}
                            style={{
                                padding: '0.75rem 2rem',
                                background: selectedLight
                                    ? 'linear-gradient(to right, #2563eb, #7c3aed)'
                                    : '#334155',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: selectedLight ? 'pointer' : 'not-allowed',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                opacity: selectedLight ? 1 : 0.5
                            }}
                        >
                            Preview Design
                        </button>
                    ) : (
                        <button
                            onClick={editDesign}
                            style={{
                                padding: '0.75rem 2rem',
                                background: '#334155',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 600
                            }}
                        >
                            Edit Lines
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PreviewCanvas;
