import React from 'react';

const LIGHT_TYPES = [
    { id: 'warm-white', name: 'Warm White', color: '#fef3c7', glow: 'rgba(254, 243, 199, 0.6)' },
    { id: 'cool-white', name: 'Cool White', color: '#f8fafc', glow: 'rgba(248, 250, 252, 0.6)' },
    { id: 'multicolor', name: 'Multi-Color', color: 'linear-gradient(90deg, #ef4444, #3b82f6, #22c55e, #eab308)', glow: 'rgba(255, 255, 255, 0.4)' },
    { id: 'blue-icy', name: 'Icy Blue', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)' },
    { id: 'red-green', name: 'Festive', color: 'linear-gradient(90deg, #ef4444, #22c55e)', glow: 'rgba(239, 68, 68, 0.4)' },
];

const LightSelector = ({ selectedLight, onSelectLight }) => {
    return (
        <div style={{ width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', gap: '0.75rem', minWidth: 'max-content' }}>
                {LIGHT_TYPES.map((light) => (
                    <button
                        key={light.id}
                        onClick={() => onSelectLight(light)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: selectedLight?.id === light.id ? '#1e293b' : 'transparent',
                            border: selectedLight?.id === light.id ? '2px solid #3b82f6' : '2px solid #334155',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedLight?.id !== light.id) {
                                e.currentTarget.style.borderColor = '#475569';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedLight?.id !== light.id) {
                                e.currentTarget.style.borderColor = '#334155';
                            }
                        }}
                    >
                        <div
                            style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                borderRadius: '50%',
                                background: light.color,
                                boxShadow: selectedLight?.id === light.id
                                    ? `0 0 16px ${light.glow}`
                                    : '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }}
                        />
                        <span
                            style={{
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                color: selectedLight?.id === light.id ? '#ffffff' : '#94a3b8',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {light.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LightSelector;
