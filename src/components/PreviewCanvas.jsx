import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

const PreviewCanvas = ({ image, selectedLight, onReset }) => {
    const [lights, setLights] = useState([]);
    const containerRef = useRef(null);

    // Simple click to add lights logic for now
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
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
        >
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button
                    onClick={clearLights}
                    className="p-2 bg-slate-800/80 backdrop-blur text-white rounded-full hover:bg-red-500/80 transition-colors"
                    title="Clear all lights"
                >
                    <Trash2 size={20} />
                </button>
                <button
                    onClick={onReset}
                    className="p-2 bg-slate-800/80 backdrop-blur text-white rounded-full hover:bg-slate-700 transition-colors"
                    title="Close preview"
                >
                    <X size={20} />
                </button>
            </div>

            <div
                ref={containerRef}
                className="relative w-full cursor-crosshair"
                onClick={handleImageClick}
            >
                <img
                    src={image}
                    alt="Home Preview"
                    className="w-full h-auto object-contain max-h-[70vh]"
                />

                {/* Overlay Instructions */}
                {lights.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full text-white font-medium">
                            Tap anywhere to place lights
                        </div>
                    </div>
                )}

                {/* Render Lights */}
                {lights.map((light, index) => (
                    <div
                        key={index}
                        className="absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: `${light.x}%`,
                            top: `${light.y}%`,
                            background: light.type.color.includes('gradient') ? light.type.color : light.type.color,
                            boxShadow: `0 0 15px 2px ${light.type.glow}, 0 0 30px 5px ${light.type.glow}`,
                        }}
                    />
                ))}
            </div>

            <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                <p className="text-center text-slate-400 text-sm">
                    Selected: <span className="text-white font-medium">{selectedLight?.name || 'None'}</span>
                </p>
            </div>
        </motion.div>
    );
};

export default PreviewCanvas;
