import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCodeLib from 'qrcode';
import { isMobileDevice, getCurrentPageUrl } from '../utils/deviceDetection';

const ImageUploader = ({ onImageSelect }) => {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        setIsMobile(isMobileDevice());

        // Generate QR code for desktop users
        if (!isMobileDevice()) {
            const pageUrl = getCurrentPageUrl();
            QRCodeLib.toDataURL(pageUrl, { width: 200, margin: 2 })
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

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-slate-400 bg-slate-800/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleChange}
                />

                <div className="flex flex-col items-center gap-6">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {isMobile ? <Camera size={48} /> : <Upload size={48} />}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">
                            {isMobile ? 'Take or Upload a Photo' : 'Upload a Photo of Your Home'}
                        </h3>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                            {isMobile
                                ? 'Use your camera or choose from your photos'
                                : 'Drag and drop an image, or click to browse'}
                        </p>
                    </div>

                    {isMobile ? (
                        // Mobile: Camera + Upload buttons
                        <div className="flex gap-3 w-full max-w-sm">
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Camera size={20} />
                                Take Photo
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-semibold"
                            >
                                <Upload size={20} />
                                Upload
                            </button>
                        </div>
                    ) : (
                        // Desktop: Upload button + QR code
                        <div className="space-y-6 w-full">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Upload size={20} />
                                Choose File
                            </button>

                            {qrCodeUrl && (
                                <div className="pt-6 border-t border-slate-700">
                                    <p className="text-slate-400 text-sm mb-4">Or scan with your phone to take a photo:</p>
                                    <div className="flex justify-center">
                                        <div className="bg-white p-4 rounded-xl">
                                            <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-3">Scan this QR code with your phone's camera</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ImageUploader;
