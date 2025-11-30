import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import LightSelector from './components/LightSelector';
import PreviewCanvas from './components/PreviewCanvas';
import { Sparkles, X } from 'lucide-react';

function App({ onClose }) {
  const [image, setImage] = useState(null);
  const [selectedLight, setSelectedLight] = useState(null);

  return (
    // Full viewport backdrop with solid dark background - using inline styles for reliability
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(2, 6, 23, 0.95)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Centered Modal - Compact size, no scrolling */}
      <div
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '1rem',
          border: '1px solid #1e293b',
          maxWidth: '42rem',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header - Compact */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="text-white" size={18} />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              HolidayLights Preview
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        {/* Main Content - Compact, no scroll */}
        <main className="p-6">
          {!image ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Preview Christmas Lights
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    On Your Home
                  </span>
                </h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Upload a photo and see how different holiday lighting styles would look
                </p>
              </div>
              <ImageUploader onImageSelect={setImage} />
            </div>
          ) : (
            <div className="space-y-4">
              <PreviewCanvas
                image={image}
                selectedLight={selectedLight}
                onReset={() => {
                  setImage(null);
                  setSelectedLight(null);
                }}
              />

              {/* Light Selector inline instead of footer */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-2">Select Light Style</p>
                <LightSelector
                  selectedLight={selectedLight}
                  onSelectLight={setSelectedLight}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
