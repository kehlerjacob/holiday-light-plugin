import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import LightSelector from './components/LightSelector';
import PreviewCanvas from './components/PreviewCanvas';
import { Sparkles, X } from 'lucide-react';

function App({ onClose }) {
  const [image, setImage] = useState(null);
  const [selectedLight, setSelectedLight] = useState(null);

  return (
    // Full viewport backdrop - FULLY OPAQUE, no blur
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // Fully opaque dark background
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Centered Modal Card - Compact and complete */}
      <div
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '1rem',
          border: '1px solid #1e293b',
          maxWidth: '36rem', // Smaller max width
          width: '100%',
          maxHeight: '85vh', // Ensure it fits in viewport
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header - Very Compact */}
        <header
          className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900"
          style={{
            borderBottom: '1px solid #1e293b',
            padding: '0.5rem 1rem'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="text-white" size={16} />
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              HolidayLights Preview
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        {/* Main Content - Compact, scrollable if needed */}
        <main
          className="p-4 overflow-y-auto"
          style={{
            padding: '1rem',
            overflowY: 'auto',
            maxHeight: 'calc(85vh - 3rem)' // Account for header
          }}
        >
          {!image ? (
            <div className="text-center space-y-3">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Preview Christmas Lights
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    On Your Home
                  </span>
                </h2>
                <p className="text-slate-400 text-xs max-w-md mx-auto">
                  Upload a photo and see how different holiday lighting styles would look
                </p>
              </div>
              <ImageUploader onImageSelect={setImage} />
            </div>
          ) : (
            <div className="space-y-3">
              <PreviewCanvas
                image={image}
                selectedLight={selectedLight}
                onReset={() => {
                  setImage(null);
                  setSelectedLight(null);
                }}
              />

              {/* Light Selector inline */}
              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-400 mb-2">Select Light Style</p>
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
