import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { isMobileDevice, getCurrentPageUrl } from '../utils/deviceDetection';

const ImageUploader = ({ onImageSelect }) => {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        setIsMobile(isMobileDevice());

        // Generate QR code for desktop users
        if (!isMobileDevice()) {
            const pageUrl = getCurrentPageUrl();
            QRCodeLib.toDataURL(pageUrl, { width: 160, margin: 1 }) // Smaller QR code
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error('QR Code generation failed:', err));
        }
    }, []);

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onImageSelect(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div style={{ width: '100%', marginTop: '1rem' }}>
            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleChange}
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleChange}
            />

            {isMobile ? (
                // Mobile: Simple buttons
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                    <button
                        onClick={() => cameraInputRef.current?.click()}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: 'linear-gradient(to right, #2563eb, #3b82f6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        <Camera size={18} />
                        Take Photo
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: '#334155',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        <Upload size={18} />
                        Upload
                    </button>
                </div>
            ) : (
                // Desktop: Upload button + compact QR code
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            width: '100%',
                            maxWidth: '20rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        <Upload size={18} />
                        Choose File
                    </button>

                    {qrCodeUrl && (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                Or scan to use your phone:
                            </p>
                            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.5rem', display: 'inline-block' }}>
                                <img src={qrCodeUrl} alt="QR Code" style={{ width: '160px', height: '160px', display: 'block' }} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
