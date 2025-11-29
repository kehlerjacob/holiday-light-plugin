import React from 'react';
import { motion } from 'framer-motion';

const LIGHT_TYPES = [
    { id: 'warm-white', name: 'Warm White', color: '#fef3c7', glow: 'rgba(254, 243, 199, 0.6)' },
    { id: 'cool-white', name: 'Cool White', color: '#f8fafc', glow: 'rgba(248, 250, 252, 0.6)' },
    { id: 'multicolor', name: 'Multi-Color', color: 'linear-gradient(90deg, #ef4444, #3b82f6, #22c55e, #eab308)', glow: 'rgba(255, 255, 255, 0.4)' },
    { id: 'blue-icy', name: 'Icy Blue', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)' },
    { id: 'red-green', name: 'Festive', color: 'linear-gradient(90deg, #ef4444, #22c55e)', glow: 'rgba(239, 68, 68, 0.4)' },
];

const LightSelector = ({ selectedLight, onSelectLight }) => {
    return (
        <div className="w-full overflow-x-auto py-4 px-2 no-scrollbar">
            <div className="flex gap-4 min-w-max px-2">
                {LIGHT_TYPES.map((light) => (
                    <motion.button
                        key={light.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectLight(light)}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${selectedLight?.id === light.id
                                ? 'border-blue-500 bg-slate-800 ring-2 ring-blue-500/20'
                                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                            }`}
                    >
                        <div
                            className="w-12 h-12 rounded-full shadow-lg"
                            style={{
                                background: light.color,
                                boxShadow: selectedLight?.id === light.id ? `0 0 20px ${light.glow}` : 'none'
                            }}
                        />
                        <span className="text-sm font-medium text-slate-300 whitespace-nowrap">
                            {light.name}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default LightSelector;
