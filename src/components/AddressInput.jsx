import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader, Image as ImageIcon } from 'lucide-react';

const AddressInput = ({ onAddressSelect, onSwitchToUpload }) => {
    const [query, setQuery] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Use provided key as default
    const defaultKey = 'AIzaSyDs-lSUxw7qN3Ae0CK6TvcrTUSKXK_kdY8';

    const [apiKey, setApiKey] = useState(() => {
        return localStorage.getItem('google_maps_key') || defaultKey;
    });

    const [showKeyInput, setShowKeyInput] = useState(() => {
        const key = localStorage.getItem('google_maps_key') || defaultKey;
        return !key;
    });

    const [error, setError] = useState(null);

    const autocompleteService = useRef(null);
    const sessionToken = useRef(null);

    const [mapsLoaded, setMapsLoaded] = useState(false);

    useEffect(() => {
        const initService = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                try {
                    if (!autocompleteService.current) {
                        console.log("Initializing AutocompleteService...");
                        autocompleteService.current = new window.google.maps.places.AutocompleteService();
                        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
                    }
                    setMapsLoaded(true);
                    return true;
                } catch (e) {
                    console.error("Error initializing Maps service:", e);
                    return false;
                }
            }
            return false;
        };

        if (apiKey) {
            if (initService()) return;

            if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
                console.log("Loading Google Maps script...");
                loadGoogleMaps(apiKey);
            } else {
                console.log("Maps script detected, waiting for initialization...");
            }

            // Always poll until ready
            const interval = setInterval(() => {
                if (initService()) clearInterval(interval);
            }, 500);
            return () => clearInterval(interval);
        }
    }, [apiKey]);

    const loadGoogleMaps = (key) => {
        if (window.google?.maps) return;
        if (document.querySelector(`script[src*="maps.googleapis.com"]`)) return;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
        script.async = true;
        script.onload = () => {
            console.log("Google Maps script loaded successfully");
        };
        script.onerror = () => {
            console.error("Failed to load Google Maps script");
            setError('Failed to load Google Maps script. Check your internet connection.');
            setShowKeyInput(true);
        };
        document.body.appendChild(script);
    };

    const handleKeySubmit = (e) => {
        e.preventDefault();
        if (apiKey.trim()) {
            localStorage.setItem('google_maps_key', apiKey);
            setShowKeyInput(false);
            window.location.reload();
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (!value.trim()) {
            setPredictions([]);
            return;
        }

        if (!mapsLoaded || !autocompleteService.current) {
            console.warn("Maps service not ready yet");
            return;
        }

        setIsLoading(true);
        setError(null);

        autocompleteService.current.getPlacePredictions(
            {
                input: value,
                sessionToken: sessionToken.current,
                types: ['address'],
            },
            (results, status) => {
                setIsLoading(false);
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results);
                } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    setPredictions([]);
                } else {
                    console.error("Places API Error:", status);
                    setPredictions([]);
                    if (status === 'REQUEST_DENIED') {
                        setError('API Key Error: Request Denied. Check API restrictions.');
                        setShowKeyInput(true);
                    } else if (status === 'OVER_QUERY_LIMIT') {
                        setError('API Quota Exceeded.');
                    } else {
                        setError(`Maps Error: ${status}`);
                    }
                }
            }
        );
    };

    const handleSelect = (prediction) => {
        setQuery(prediction.description);
        setPredictions([]);

        // Construct Street View Static API URL
        const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=1024x768&location=${encodeURIComponent(prediction.description)}&key=${apiKey}`;

        onAddressSelect(imageUrl);
    };

    if (showKeyInput) {
        return (
            <div style={{ width: '100%', maxWidth: '32rem', margin: '0 auto' }}>
                <div style={{
                    backgroundColor: '#1e293b',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #334155',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>Setup Google Maps</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        To use the address feature, you need a Google Maps API Key with <strong>Places</strong> and <strong>Street View Static</strong> APIs enabled.
                    </p>
                    <form onSubmit={handleKeySubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter API Key"
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #475569',
                                backgroundColor: '#0f172a',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Save
                        </button>
                    </form>
                    <button
                        onClick={onSwitchToUpload}
                        style={{
                            marginTop: '1rem',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        Skip and use Photo Upload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '32rem', margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#1e293b',
                    borderRadius: '0.75rem',
                    border: '1px solid #334155',
                    padding: '0.25rem'
                }}>
                    <div style={{ padding: '0.75rem', color: '#94a3b8' }}>
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        disabled={!mapsLoaded}
                        placeholder={mapsLoaded ? "Enter your home address..." : "Initializing Google Maps..."}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none',
                            padding: '0.5rem 0',
                            opacity: mapsLoaded ? 1 : 0.5,
                            cursor: mapsLoaded ? 'text' : 'wait'
                        }}
                    />
                    {isLoading && (
                        <div style={{ padding: '0.75rem', color: '#3b82f6' }}>
                            <Loader size={20} className="animate-spin" />
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid #ef4444',
                        borderRadius: '0.5rem',
                        color: '#fca5a5',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Predictions Dropdown - Now in-flow to prevent clipping */}
                {(predictions.length > 0 || isLoading || (query.length > 3 && predictions.length === 0)) && (
                    <div style={{
                        marginTop: '0.5rem',
                        backgroundColor: '#1e293b',
                        borderRadius: '0.75rem',
                        border: '1px solid #334155',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        width: '100%'
                    }}>
                        {isLoading && (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                                <Loader size={20} className="animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                Searching...
                            </div>
                        )}

                        {!isLoading && predictions.length === 0 && query.length > 3 && (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                                No address found. Try a different search.
                            </div>
                        )}

                        {!isLoading && predictions.map((prediction) => (
                            <button
                                key={prediction.place_id}
                                onClick={() => handleSelect(prediction)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid #334155',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <MapPin size={18} color="#94a3b8" style={{ minWidth: '18px' }} />
                                <div>
                                    <div style={{ fontWeight: 500 }}>{prediction.structured_formatting.main_text}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                        {prediction.structured_formatting.secondary_text}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    or
                </p>
                <button
                    onClick={onSwitchToUpload}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'rgba(51, 65, 85, 0.5)',
                        color: '#e2e8f0',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.8)';
                        e.currentTarget.style.borderColor = '#475569';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
                        e.currentTarget.style.borderColor = '#334155';
                    }}
                >
                    <ImageIcon size={18} />
                    Upload a Photo Instead
                </button>
            </div>
        </div>
    );
};

export default AddressInput;
