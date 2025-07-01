
export const generateBrowserFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no_canvas';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      (navigator.hardwareConcurrency || 'unknown').toString(),
      (navigator.maxTouchPoints || 0).toString()
    ].join('|');
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  } catch (error) {
    console.error("Fingerprint generation failed:", error);
    return "fingerprint_error";
  }
};

export const createNewSessionId = () => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const browserFingerprint = generateBrowserFingerprint().substring(0, 8);
  const tabId = Math.random().toString(36).substring(2, 9);
  
  const newSessionId = `session_${timestamp}_${randomId}_${browserFingerprint}_${tabId}`;
  return newSessionId;
};
