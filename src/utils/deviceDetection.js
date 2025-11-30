// Utility to detect if user is on mobile device
export const isMobileDevice = () => {
    // Check user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

    // Also check screen width as a fallback
    const isMobileWidth = window.innerWidth <= 768;

    return mobileRegex.test(userAgent.toLowerCase()) || isMobileWidth;
};

// Get current page URL for QR code
export const getCurrentPageUrl = () => {
    return window.location.href;
};
