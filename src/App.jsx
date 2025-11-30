import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import LightSelector from './components/LightSelector';
import PreviewCanvas from './components/PreviewCanvas';
import { X } from 'lucide-react';

function App({ onClose }) {
  const [image, setImage] = useState(null);
  const [selectedLight, setSelectedLight] = useState(null);

  return (
    // Fully opaque black background
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Modal Card - Expands when image is uploaded */}
      <div
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '1rem',
          border: '1px solid #1e293b',
          maxWidth: image ? '80rem' : '32rem', // Expand to 80rem after upload
          width: '100%',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease-in-out' // Smooth expansion
        }}
      >
        {/* Minimal Header - Just close button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0.75rem',
            borderBottom: '1px solid #1e293b'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.25rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '9999px',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1e293b';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#94a3b8';
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {!image ? (
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '0.5rem'
                }}
              >
                Preview Holiday Lights
              </h2>
              <ImageUploader onImageSelect={setImage} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              {/* Preview Canvas - Takes most of the space */}
              <div style={{ flex: 1, minHeight: 0 }}>
                <PreviewCanvas
                  image={image}
                  selectedLight={selectedLight}
                  onReset={() => {
                    setImage(null);
                    setSelectedLight(null);
                  }}
                />
              </div>

              {/* Light Selector - Compact footer */}
              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid #1e293b'
                }}
              >
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Select Light Style
                </p>
                <LightSelector
                  selectedLight={selectedLight}
                  onSelectLight={setSelectedLight}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
