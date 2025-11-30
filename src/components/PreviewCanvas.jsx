import React, { useRef, useState, useEffect } from 'react';

const PreviewCanvas = ({ image, selectedLight, onReset }) => {
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showLights, setShowLights] = useState(false);
    const [clickPoint, setClickPoint] = useState(null);
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Update container size when image loads
    useEffect(() => {
        if (containerRef.current) {
            const updateSize = () => {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            };
            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }
    }, [image]);

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

    // Track if we're dragging to prevent click events after drag
    const isDraggingRef = useRef(false);

    const handleClick = (e) => {
        if (showLights || isDrawing || isDraggingRef.current) return;

        const coords = getCoordinates(e);
        if (!coords) return;

        if (!clickPoint) {
            setClickPoint(coords);
        } else {
            const newLine = [clickPoint, coords];
            setLines([...lines, newLine]);
            setClickPoint(null);
        }
    };

    const handleMouseDown = (e) => {
        if (showLights || clickPoint) return;

        isDraggingRef.current = false;
        setIsDrawing(true);
        const coords = getCoordinates(e);
        if (coords) {
            setCurrentLine([coords]);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || showLights) return;

        isDraggingRef.current = true; // We are definitely dragging now

        const coords = getCoordinates(e);
        if (coords) {
            setCurrentLine(prev => [...prev, coords]);
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;

        setIsDrawing(false);
        if (currentLine.length > 1) {
            setLines(prev => [...prev, currentLine]);
        }
        setCurrentLine([]);

        // Reset dragging flag after a short delay to allow click event to fire (and be blocked)
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 100);
    };

    const clearLines = () => {
        setLines([]);
        setCurrentLine([]);
        setClickPoint(null);
        setShowLights(false);
    };

    const previewDesign = () => {
        if (lines.length === 0) return;
        setClickPoint(null);
        setShowLights(true);
    };

    const editDesign = () => {
        setShowLights(false);
    };

    const generateLights = () => {
        if (!selectedLight) return [];
        const lights = [];
        const spacing = 3.5; // Increased spacing for better bulb separation

        lines.forEach(line => {
            if (line.length < 2) return;

            // Calculate total length of the line
            let totalLength = 0;
            const segments = [];

            for (let i = 0; i < line.length - 1; i++) {
                const start = line[i];
                const end = line[i + 1];
                const dist = Math.sqrt(
                    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
                );
                segments.push({ start, end, dist, accumulated: totalLength });
                totalLength += dist;
            }

            // Place lights at fixed intervals
            let currentDist = 0;
            while (currentDist <= totalLength) {
                // Find which segment this distance falls into
                const segment = segments.find(s =>
                    currentDist >= s.accumulated &&
                    currentDist <= s.accumulated + s.dist
                );

                if (segment) {
                    const segmentProgress = (currentDist - segment.accumulated) / segment.dist;
                    lights.push({
                        x: segment.start.x + (segment.end.x - segment.start.x) * segmentProgress,
                        y: segment.start.y + (segment.end.y - segment.start.y) * segmentProgress,
                        type: selectedLight
                    });
                }

                currentDist += spacing;
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
                        fontWeight: 600
                    }}
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
                        fontWeight: 600
                    }}
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
                    WebkitUserSelect: 'none',
                    touchAction: 'none'
                }}
                onClick={handleClick}
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
                        display: 'block',
                        pointerEvents: 'none'
                    }}
                    draggable={false}
                />

                {/* Canvas overlay for lines */}
                <div
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
                        <svg
                            key={`line-${lineIndex}`}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none'
                            }}
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <polyline
                                points={line.map(p => `${p.x},${p.y}`).join(' ')}
                                fill="none"
                                stroke="#60a5fa"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeOpacity="0.7"
                                vectorEffect="non-scaling-stroke"
                                style={{ filter: 'drop-shadow(0 0 6px rgba(96, 165, 250, 0.8))' }}
                            />
                        </svg>
                    ))}

                    {/* Draw current line being drawn */}
                    {!showLights && currentLine.length > 0 && (
                        <svg
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none'
                            }}
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <polyline
                                points={currentLine.map(p => `${p.x},${p.y}`).join(' ')}
                                fill="none"
                                stroke="#93c5fd"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeOpacity="0.6"
                                vectorEffect="non-scaling-stroke"
                                style={{ filter: 'drop-shadow(0 0 6px rgba(147, 197, 253, 0.7))' }}
                            />
                        </svg>
                    )}
                </div>

                {/* Instructions */}
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
                                textAlign: 'center'
                            }}
                        >
                            Click two points to draw a line<br />
                            or click and drag to draw freeform
                        </div>
                    </div>
                )}

                {/* Render Lights */}
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
