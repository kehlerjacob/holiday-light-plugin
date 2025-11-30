import React, { useRef, useState, useEffect } from 'react';

const PreviewCanvas = ({ image, selectedLight, onReset }) => {
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showLights, setShowLights] = useState(false);
    const [isNightMode, setIsNightMode] = useState(false);
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const canvasRef = useRef(null); // Hidden canvas for pixel data
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

    // Initialize hidden canvas with image data
    useEffect(() => {
        if (imageRef.current && canvasRef.current) {
            const img = imageRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const handleLoad = () => {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
            };

            if (img.complete) {
                handleLoad();
            } else {
                img.addEventListener('load', handleLoad);
                return () => img.removeEventListener('load', handleLoad);
            }
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

    // Edge detection and snapping logic
    const snapLineToEdges = (linePoints) => {
        if (!canvasRef.current || linePoints.length < 2) return linePoints;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Helper to get grayscale value at x,y
        const getPixel = (x, y) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return 0;
            const i = (Math.floor(y) * width + Math.floor(x)) * 4;
            // Simple luminance
            return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        };

        // Search radius for edges (in image pixels)
        // Scale radius based on image size vs display size
        const searchRadius = Math.max(5, Math.min(width, height) * 0.02);

        const snappedPoints = linePoints.map(point => {
            // Convert percentage to image coordinates
            const imgX = (point.x / 100) * width;
            const imgY = (point.y / 100) * height;

            let bestX = imgX;
            let bestY = imgY;
            let maxGradient = 0;

            // Search local window for strongest edge
            for (let dy = -searchRadius; dy <= searchRadius; dy += 2) {
                for (let dx = -searchRadius; dx <= searchRadius; dx += 2) {
                    const x = imgX + dx;
                    const y = imgY + dy;

                    // Sobel-like gradient calculation
                    const gx = getPixel(x + 1, y - 1) + 2 * getPixel(x + 1, y) + getPixel(x + 1, y + 1) -
                        (getPixel(x - 1, y - 1) + 2 * getPixel(x - 1, y) + getPixel(x - 1, y + 1));
                    const gy = getPixel(x - 1, y + 1) + 2 * getPixel(x, y + 1) + getPixel(x + 1, y + 1) -
                        (getPixel(x - 1, y - 1) + 2 * getPixel(x, y - 1) + getPixel(x + 1, y - 1));

                    const gradient = Math.sqrt(gx * gx + gy * gy);

                    // Bias towards original point to prevent jumping too far for weak edges
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const weightedGradient = gradient / (1 + dist * 0.1);

                    if (weightedGradient > maxGradient && weightedGradient > 50) { // Threshold
                        maxGradient = weightedGradient;
                        bestX = x;
                        bestY = y;
                    }
                }
            }

            // Convert back to percentage
            return {
                x: (bestX / width) * 100,
                y: (bestY / height) * 100
            };
        });

        // Ramer-Douglas-Peucker simplification
        const simplifyLine = (points, epsilon) => {
            if (points.length < 3) return points;

            let dmax = 0;
            let index = 0;
            const end = points.length - 1;

            for (let i = 1; i < end; i++) {
                // Perpendicular distance from point to line segment
                const d = perpendicularDistance(points[i], points[0], points[end]);
                if (d > dmax) {
                    index = i;
                    dmax = d;
                }
            }

            if (dmax > epsilon) {
                const recResults1 = simplifyLine(points.slice(0, index + 1), epsilon);
                const recResults2 = simplifyLine(points.slice(index), epsilon);
                return [...recResults1.slice(0, -1), ...recResults2];
            } else {
                return [points[0], points[end]];
            }
        };

        const perpendicularDistance = (point, lineStart, lineEnd) => {
            let dx = lineEnd.x - lineStart.x;
            let dy = lineEnd.y - lineStart.y;
            if (dx === 0 && dy === 0) {
                return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2));
            }

            const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);

            let closestX, closestY;
            if (t < 0) {
                closestX = lineStart.x;
                closestY = lineStart.y;
            } else if (t > 1) {
                closestX = lineEnd.x;
                closestY = lineEnd.y;
            } else {
                closestX = lineStart.x + t * dx;
                closestY = lineStart.y + t * dy;
            }

            return Math.sqrt(Math.pow(point.x - closestX, 2) + Math.pow(point.y - closestY, 2));
        };

        // Apply simplification (epsilon of 0.5% is usually good for this scale)
        return simplifyLine(snappedPoints, 0.5);
    };

    const handleMouseDown = (e) => {
        if (showLights) return;

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
            setCurrentLine(prev => [...prev, coords]);
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;

        setIsDrawing(false);
        if (currentLine.length > 1) {
            // Snap the line to edges before saving
            const snappedLine = snapLineToEdges(currentLine);
            setLines(prev => [...prev, snappedLine]);
        }
        setCurrentLine([]);
    };

    const clearLines = () => {
        setLines([]);
        setCurrentLine([]);
        setShowLights(false);
        setIsNightMode(false);
    };

    const previewDesign = () => {
        if (lines.length === 0) return;
        setShowLights(true);
        setIsNightMode(true);
    };

    const editDesign = () => {
        setShowLights(false);
        setIsNightMode(false);
    };

    const toggleNightMode = () => {
        setIsNightMode(!isNightMode);
    };

    const generateLights = () => {
        if (!selectedLight) return [];
        const lights = [];
        const spacing = 3.5;

        lines.forEach(line => {
            if (line.length < 2) return;

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

            let currentDist = 0;
            while (currentDist <= totalLength) {
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
            {/* Hidden canvas for image processing */}
            <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
            />

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
                {showLights && (
                    <button
                        onClick={toggleNightMode}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: isNightMode ? 'rgba(59, 130, 246, 0.9)' : 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(8px)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        {isNightMode ? 'Day Mode' : 'Night Mode'}
                    </button>
                )}
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
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    ref={imageRef}
                    src={image}
                    alt="Home Preview"
                    crossOrigin="anonymous" // Needed for canvas to read pixels if image is from external URL
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        maxHeight: '70vh',
                        display: 'block',
                        pointerEvents: 'none',
                        transition: 'filter 0.5s ease',
                        filter: isNightMode
                            ? 'brightness(0.4) contrast(1.2) saturate(1.2)'
                            : 'none'
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
                            Click and drag to draw lines<br />
                            Lines will snap to edges automatically
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
