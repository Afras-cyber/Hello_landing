
export interface AffiliateLink {
  url: string;
  qrCode?: string;
  utmParams: {
    source: string;
    medium: string;
    campaign: string;
    content?: string;
    term?: string;
  };
}

export function generateAffiliateLink(
  campaignSlug: string,
  influencerName: string,
  source: 'instagram' | 'tiktok' | 'youtube' | 'website' = 'instagram',
  content?: string
): AffiliateLink {
  const baseUrl = window.location.origin;
  const utmParams = {
    source,
    medium: 'social',
    campaign: campaignSlug,
    content: content || influencerName.toLowerCase().replace(/\s+/g, '_'),
    term: influencerName.toLowerCase().replace(/\s+/g, '_')
  };

  const params = new URLSearchParams();
  params.append('utm_source', utmParams.source);
  params.append('utm_medium', utmParams.medium);
  params.append('utm_campaign', utmParams.campaign);
  if (utmParams.content) params.append('utm_content', utmParams.content);
  if (utmParams.term) params.append('utm_term', utmParams.term);

  const url = `${baseUrl}/kampanja/${campaignSlug}?${params.toString()}`;

  return {
    url,
    utmParams,
  };
}

export function generateQRCode(url: string): string {
  // Using QR Server API for QR code generation
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  return qrApiUrl;
}

export function trackAffiliateClick(
  campaignId: string,
  redirectId: string,
  utmParams: Record<string, string>,
  sessionId?: string
) {
  const sessionIdentifier = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store session ID in localStorage for tracking conversions
  localStorage.setItem('affiliate_session_id', sessionIdentifier);
  localStorage.setItem('affiliate_campaign_id', campaignId);

  // Track the click via edge function
  fetch('/functions/v1/track-affiliate-click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      campaignId,
      redirectId,
      sessionId: sessionIdentifier,
      utmParams,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    }),
  }).catch(error => {
    console.error('Error tracking affiliate click:', error);
  });

  return sessionIdentifier;
}

export function trackConversion(
  conversionType: 'booking' | 'consultation' | 'purchase',
  value?: number,
  serviceType?: string,
  bookingId?: string,
  discountCode?: string
) {
  const sessionId = localStorage.getItem('affiliate_session_id');
  const campaignId = localStorage.getItem('affiliate_campaign_id');

  if (!sessionId || !campaignId) {
    console.log('No affiliate session found for conversion tracking');
    return;
  }

  // Track conversion via Supabase
  fetch('/rest/v1/campaign_conversions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'your-supabase-anon-key', // This would be from env
    },
    body: JSON.stringify({
      campaign_id: campaignId,
      session_id: sessionId,
      conversion_type: conversionType,
      conversion_value: value,
      service_type: serviceType,
      booking_id: bookingId,
      discount_code_used: discountCode,
    }),
  }).catch(error => {
    console.error('Error tracking conversion:', error);
  });
}
