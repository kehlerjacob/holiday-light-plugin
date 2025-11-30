import React, { useRef, useState } from 'react';

const PreviewCanvas = ({ image, selectedLight, onReset }) => {
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showLights, setShowLights] = useState(false);
    const [clickPoint, setClickPoint] = useState(null); // Single point for click mode
    const containerRef = useRef(null);

    const getCoordinates = (e) => {
        if (!containerRef.current) return null;
        const rect = containerRef.current.getBoundingClientRect();

        const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
        const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

        if (clientX === undefined || clientY === undefined) return null;

        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        return { x, y };
    };

    // Click mode - connect points with straight lines
    const handleClick = (e) => {
        if (showLights || isDrawing) return;

        const coords = getCoordinates(e);
        if (!coords) return;

        if (!clickPoint) {
            // First click - set the starting point
            setClickPoint(coords);
        } else {
            // Second click - create a line from first point to second point
            const newLine = [clickPoint, coords];
            setLines([...lines, newLine]);
            setClickPoint(null); // Reset for next line
        }
    };

    // Drag mode - draw freeform lines
    const handleMouseDown = (e) => {
        if (showLights) return;

        // Clear any pending click point when starting to drag
        setClickPoint(null);

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
        setClickPoint(null);
        setShowLights(false);
    };

    const previewDesign = () => {
        if (lines.length === 0) return;
        setClickPoint(null); // Clear any pending click point
        setShowLights(true);
    };

    const editDesign = () => {
        setShowLights(false);
    };

    // Generate light positions along all lines
    const generateLights = () => {
        if (!selectedLight) return [];
        const lights = [];
        const spacing = 2.5;

        lines.forEach(line => {
            for (let i = 0; i < line.length - 1; i++) {
                const start = line[i];
                const end = line[i + 1];
                const distance = Math.sqrt(
                    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
                );
                const numLights = Math.max(1, Math.floor(distance / spacing));

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
            {/* Action Buttons */}
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
                    cursor: showLights ? 'default' : 'crosshair',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                }}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={(e) => {
                    e.preventDefault();
                    handleClick(e);
                }}
            >
                <img
                    src={image}
                    alt="Home Preview"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        maxHeight: '70vh',
                        display: 'block',
                        pointerEvents: 'none'
                    }}
                    draggable={false}
                />

                {/* SVG Canvas for Drawing Lines */}
                <svg
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                    }}
                >
                    {/* Draw completed lines - ALWAYS VISIBLE */}
                    {lines.map((line, lineIndex) => (
                        <polyline
                            key={`line-${lineIndex}`}
                            points={line.map(p => `${p.x}%,${p.y}%`).join(' ')}
                            fill="none"
                            stroke={showLights ? 'transparent' : '#3b82f6'}
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

                    {/* Show first click point */}
                    {!showLights && clickPoint && (
                        <circle
                            cx={`${clickPoint.x}%`}
                            cy={`${clickPoint.y}%`}
                            r="6"
                            fill="#3b82f6"
                            stroke="white"
                            strokeWidth="2"
                            opacity="0.9"
                        />
                    )}
                </svg>

                {/* Instructions Overlay */}
                {!showLights && lines.length === 0 && currentLine.length === 0 && !clickPoint && (
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
                                textAlign: 'center',
                                maxWidth: '80%'
                            }}
                        >
                            Click two points to draw a straight line<br />
                            or click and drag to draw freeform
                        </div>
                    </div>
                )}

                {/* Render Lights when previewing */}
                {showLights && lightsToRender.map((light, index) => (
                    <div
                        key={`light-${index}`}
                        style={{
                            position: 'absolute',
                            left: `${light.x}%`,
                            top: `${light.y}%`,
                            width: '0.75rem',
                            height: '0.75rem',
                            borderRadius: '9999px',
                            transform: 'translate(-50%, -50%)',
                            background: light.type.color,
                            boxShadow: `0 0 12px 2px ${light.type.glow}, 0 0 24px 4px ${light.type.glow}`,
                            pointerEvents: 'none'
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
