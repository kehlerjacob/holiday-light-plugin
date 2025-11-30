import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import LightSelector from './components/LightSelector';
import PreviewCanvas from './components/PreviewCanvas';
import { Sparkles, X } from 'lucide-react';

function App({ onClose }) {
  const [image, setImage] = useState(null);
  const [selectedLight, setSelectedLight] = useState(null);

  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Centered Modal */}
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              HolidayLights Preview
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          {!image ? (
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Preview Christmas Lights
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    On Your Home
                  </span>
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Upload a photo of your house and instantly see how different holiday lighting styles would look.
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
            </div>
          )}
        </main>

        {/* Footer with Light Selector - Only show when image is uploaded */}
        {image && (
          <footer className="border-t border-slate-800 bg-slate-900/95 backdrop-blur-md p-4">
            <p className="text-sm text-slate-400 mb-2 px-2">Select Light Style</p>
            <LightSelector
              selectedLight={selectedLight}
              onSelectLight={setSelectedLight}
            />
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;
