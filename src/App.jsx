import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import LightSelector from './components/LightSelector';
import PreviewCanvas from './components/PreviewCanvas';
import { Sparkles } from 'lucide-react';

function App() {
  const [image, setImage] = useState(null);
  const [selectedLight, setSelectedLight] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              HolidayLights
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center gap-8">
        {!image ? (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Preview Christmas Lights <br />
                <span className="text-blue-500">On Your Home</span>
              </h2>
              <p className="text-lg text-slate-400">
                Upload a photo of your house and instantly see how different holiday lighting styles would look.
              </p>
            </div>
            <ImageUploader onImageSelect={setImage} />
          </div>
        ) : (
          <div className="w-full space-y-6 animate-fade-in">
            <PreviewCanvas
              image={image}
              selectedLight={selectedLight}
              onReset={() => {
                setImage(null);
                setSelectedLight(null);
              }}
            />

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800 z-40">
              <div className="max-w-4xl mx-auto">
                <p className="text-sm text-slate-400 mb-2 px-2">Select Light Style</p>
                <LightSelector
                  selectedLight={selectedLight}
                  onSelectLight={setSelectedLight}
                />
              </div>
            </div>
            {/* Spacer for fixed bottom bar */}
            <div className="h-32" />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
