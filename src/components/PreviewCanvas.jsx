import React, { useRef, useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

// C9 Bulb Component - Inverted (Socket at top)
const C9Bulb = ({ color, glow }) => {
    // Defensive check for color
    if (!color) return null;

    // Sanitize color for ID use (remove #)
    const safeColor = typeof color === 'string' ? color.replace('#', '') : 'default';

    return (
        <svg width="16" height="24" viewBox="0 0 24 36" style={{ overflow: 'visible' }}>
            <defs>
                <radialGradient id={`bulb-gradient-${safeColor}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                    <stop offset="40%" stopColor={color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </radialGradient>
                <filter id={`glow-${safeColor}`} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Glow Effect */}
            <circle cx="12" cy="22" r="16" fill={glow || color} filter={`url(#glow-${safeColor})`} opacity="0.6" />

            {/* Socket Base (At Top) */}
            <rect x="8" y="0" width="8" height="6" rx="1" fill="#1a472a" />
            <path d="M8 6 L16 6 L15 10 L9 10 Z" fill="#0f2b19" />

            {/* Bulb Shape - C9 Conical (Pointing Down) */}
            <path
                d="M12 34 
         C 16 34, 20 28, 20 22 
         C 20 16, 16 10, 12 10 
         C 8 10, 4 16, 4 22 
         C 4 28, 8 34, 12 34 Z"
                fill={`url(#bulb-gradient-${safeColor})`}
                stroke={color}
                strokeWidth="0.5"
                strokeOpacity="0.5"
            />

            {/* Facet/Reflection Highlight */}
            <path
                d="M12 32 
         C 14 32, 16 28, 16 24 
         C 16 20, 14 16, 12 16"
                fill="none"
                stroke="#fff"
                strokeWidth="1"
                strokeOpacity="0.4"
                strokeLinecap="round"
            />
        </svg>
    );
};

// ... (keep RDP functions as is) ...

// ... inside PreviewCanvas ...

const generateLights = () => {
    if (!selectedLight || containerSize.width === 0 || containerSize.height === 0) return [];
    const lights = [];
    const spacingPx = 20;

    lines.forEach(line => {
        if (line.length < 2) return;

        const pixelPoints = line.map(p => ({
            x: (p.x / 100) * containerSize.width,
            y: (p.y / 100) * containerSize.height
        }));

        let totalLength = 0;
        const segments = [];

        for (let i = 0; i < pixelPoints.length - 1; i++) {
            const start = pixelPoints[i];
            const end = pixelPoints[i + 1];
            const dist = Math.sqrt(
                Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
            );
            // Only add segments with non-zero length to avoid division by zero
            if (dist > 0) {
                segments.push({ start, end, dist, accumulated: totalLength });
                totalLength += dist;
            }
        }

        if (totalLength === 0) return;

        let currentDist = 0;
        // Ensure we don't loop infinitely if something goes wrong
        let safetyCounter = 0;
        const maxLights = 1000;

        while (currentDist <= totalLength && safetyCounter < maxLights) {
            const segment = segments.find(s =>
                currentDist >= s.accumulated &&
                currentDist <= s.accumulated + s.dist
            );

            if (segment && segment.dist > 0) {
                const segmentProgress = (currentDist - segment.accumulated) / segment.dist;

                const pixelX = segment.start.x + (segment.end.x - segment.start.x) * segmentProgress;
                const pixelY = segment.start.y + (segment.end.y - segment.start.y) * segmentProgress;

                const percentX = (pixelX / containerSize.width) * 100;
                const percentY = (pixelY / containerSize.height) * 100;

                let color = selectedLight.color;
                if (selectedLight.id === 'multicolor' || selectedLight.id === 'red-green') {
                    const colors = selectedLight.id === 'multicolor'
                        ? ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']
                        : ['#ef4444', '#22c55e'];
                    const colorIndex = Math.floor(currentDist / spacingPx) % colors.length;
                    color = colors[colorIndex];
                }

                lights.push({
                    x: percentX,
                    y: percentY,
                    color: color,
                    glow: selectedLight.glow
                });
            }

            currentDist += spacingPx;
            safetyCounter++;
        }
    });
    return lights;
};

// Ramer-Douglas-Peucker simplification
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

const simplifyLine = (points, epsilon) => {
    if (points.length < 3) return points;

    let dmax = 0;
    let index = 0;
    const end = points.length - 1;

    for (let i = 1; i < end; i++) {
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

const PreviewCanvas = ({ image, selectedLight, onReset }) => {
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showLights, setShowLights] = useState(false);
    const [isNightMode, setIsNightMode] = useState(false);
    const containerRef = useRef(null);

    // Track if we're dragging to prevent click events after drag
    const isDraggingRef = useRef(false);

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

    const handleMouseDown = (e) => {
        if (showLights) return;

        isDraggingRef.current = false;
        setIsDrawing(true);
        const coords = getCoordinates(e);
        if (coords) {
            setCurrentLine([coords]);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || showLights) return;

        isDraggingRef.current = true;
        const coords = getCoordinates(e);
        if (coords) {
            setCurrentLine(prev => [...prev, coords]);
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;

        setIsDrawing(false);
        if (currentLine.length > 1) {
            // Aggressive simplification to straighten lines
            // Epsilon of 1.5 forces rough lines to become straight segments
            const straightenedLine = simplifyLine(currentLine, 1.5);
            setLines(prev => [...prev, straightenedLine]);
        }
        setCurrentLine([]);

        setTimeout(() => {
            isDraggingRef.current = false;
        }, 100);
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
        if (!selectedLight || containerSize.width === 0 || containerSize.height === 0) return [];
        const lights = [];
        // Spacing in pixels (fixed physical distance)
        // User requested "much closer", so ~20px seems appropriate for smaller bulbs
        const spacingPx = 20;

        lines.forEach(line => {
            if (line.length < 2) return;

            // Convert line points to pixels for calculation
            const pixelPoints = line.map(p => ({
                x: (p.x / 100) * containerSize.width,
                y: (p.y / 100) * containerSize.height
            }));

            let totalLength = 0;
            const segments = [];

            for (let i = 0; i < pixelPoints.length - 1; i++) {
                const start = pixelPoints[i];
                const end = pixelPoints[i + 1];
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

                    // Interpolate in pixel space
                    const pixelX = segment.start.x + (segment.end.x - segment.start.x) * segmentProgress;
                    const pixelY = segment.start.y + (segment.end.y - segment.start.y) * segmentProgress;

                    // Convert back to percentage for responsive rendering
                    const percentX = (pixelX / containerSize.width) * 100;
                    const percentY = (pixelY / containerSize.height) * 100;

                    let color = selectedLight.color;
                    if (selectedLight.id === 'multicolor' || selectedLight.id === 'red-green') {
                        const colors = selectedLight.id === 'multicolor'
                            ? ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']
                            : ['#ef4444', '#22c55e'];
                        // Use index based on distance to keep pattern consistent
                        const colorIndex = Math.floor(currentDist / spacingPx) % colors.length;
                        color = colors[colorIndex];
                    }

                    lights.push({
                        x: percentX,
                        y: percentY,
                        color: color,
                        glow: selectedLight.glow
                    });
                }

                currentDist += spacingPx;
            }
        });
        return lights;
    };

    const lightsToRender = showLights ? generateLights() : [];

    // ... existing code ...

    const [isGenerating, setIsGenerating] = useState(false);
    const [aiImage, setAiImage] = useState(null);
    const [generationError, setGenerationError] = useState(null);

    // Generate a black and white mask from the drawn lines
    const generateControlMask = () => {
        const canvas = document.createElement('canvas');
        canvas.width = containerSize.width;
        canvas.height = containerSize.height;
        const ctx = canvas.getContext('2d');

        // Black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // White lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        lines.forEach(line => {
            if (line.length < 2) return;
            ctx.beginPath();
            ctx.moveTo((line[0].x / 100) * canvas.width, (line[0].y / 100) * canvas.height);
            for (let i = 1; i < line.length; i++) {
                ctx.lineTo((line[i].x / 100) * canvas.width, (line[i].y / 100) * canvas.height);
            }
            ctx.stroke();
        });

        return canvas.toDataURL('image/png');
    };

    const handleGenerateAI = async () => {
        const replicateKey = localStorage.getItem('replicate_api_token');
        if (!replicateKey) {
            alert("Please configure your Replicate API Key in the settings.");
            return;
        }

        if (lines.length === 0) {
            alert("Please draw some lines first!");
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setAiImage(null);

        try {
            const mask = generateControlMask();

            // 1. Create Prediction
            const response = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${replicateKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    version: "435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117", // ControlNet Scribble
                    input: {
                        image: image, // The street view image
                        structure: "scribble", // Control mode
                        prompt: "Professional photography of a house with glowing C9 Christmas lights on the roofline, night time, snowy, 8k, photorealistic, warm lighting",
                        a_prompt: "best quality, extremely detailed",
                        n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
                        scribble_map: mask, // The drawn lines
                        scale: 9,
                        ddim_steps: 20
                    }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to start generation");
            }

            const prediction = await response.json();
            const predictionId = prediction.id;

            // 2. Poll for Result
            const pollInterval = setInterval(async () => {
                const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                    headers: {
                        "Authorization": `Token ${replicateKey}`,
                    }
                });
                const statusData = await statusRes.json();

                if (statusData.status === "succeeded") {
                    clearInterval(pollInterval);
                    setAiImage(statusData.output[1]); // Usually output is [control_image, generated_image]
                    setIsGenerating(false);
                } else if (statusData.status === "failed") {
                    clearInterval(pollInterval);
                    setGenerationError("AI Generation Failed");
                    setIsGenerating(false);
                }
            }, 1000);

        } catch (e) {
            console.error(e);
            setGenerationError(e.message);
            setIsGenerating(false);
        }
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
                {/* New AI Button */}
                {!showLights && lines.length > 0 && (
                    <button
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        style={{
                            padding: '0.5rem 1rem',
                            background: isGenerating ? '#94a3b8' : 'linear-gradient(to right, #8b5cf6, #ec4899)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: isGenerating ? 'wait' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <Loader size={16} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>✨ Render with AI</>
                        )}
                    </button>
                )}

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

            {/* ... rest of render ... */}


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
                    src={image}
                    alt="Home Preview"
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

                {/* AI Generated Result Overlay */}
                {aiImage && (
                    <img
                        src={aiImage}
                        alt="AI Result"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            zIndex: 10,
                            animation: 'fadeIn 1s ease'
                        }}
                    />
                )}

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
                            Lines will automatically straighten
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
                            width: '8px',
                            height: '12px',
                            transform: 'translate(-50%, 0)', // Anchor at top (socket)
                            pointerEvents: 'none'
                        }}
                    >
                        <C9Bulb color={light.color} glow={light.glow} />
                    </div>
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
