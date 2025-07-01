
export interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
}

export const generateUTMLink = (
  baseUrl: string,
  params: UTMParams
): string => {
  const url = new URL(baseUrl);
  
  url.searchParams.set('utm_source', params.utm_source);
  url.searchParams.set('utm_medium', params.utm_medium);
  url.searchParams.set('utm_campaign', params.utm_campaign);
  
  if (params.utm_content) {
    url.searchParams.set('utm_content', params.utm_content);
  }
  
  if (params.utm_term) {
    url.searchParams.set('utm_term', params.utm_term);
  }
  
  return url.toString();
};

export const generateCampaignLinks = (
  campaignSlug: string,
  influencerName: string,
  platform: string
) => {
  const baseUrl = `${window.location.origin}/kampanja/${campaignSlug}`;
  const cleanInfluencerName = influencerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return {
    bio: generateUTMLink(baseUrl, {
      utm_source: platform,
      utm_medium: 'social',
      utm_campaign: campaignSlug,
      utm_content: 'bio',
      utm_term: cleanInfluencerName
    }),
    story: generateUTMLink(baseUrl, {
      utm_source: platform,
      utm_medium: 'social',
      utm_campaign: campaignSlug,
      utm_content: 'story',
      utm_term: cleanInfluencerName
    }),
    post: generateUTMLink(baseUrl, {
      utm_source: platform,
      utm_medium: 'social',
      utm_campaign: campaignSlug,
      utm_content: 'post',
      utm_term: cleanInfluencerName
    })
  };
};

export const generateAffiliateLink = (
  campaignSlug: string,
  influencerName: string,
  platform: string
) => {
  const baseUrl = `${window.location.origin}/kampanja/${campaignSlug}`;
  const cleanInfluencerName = influencerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return generateUTMLink(baseUrl, {
    utm_source: platform,
    utm_medium: 'affiliate',
    utm_campaign: campaignSlug,
    utm_content: 'commission',
    utm_term: cleanInfluencerName
  });
};

export const generatePaidSocialLink = (
  campaignSlug: string,
  influencerName: string,
  platform: string
) => {
  const baseUrl = `${window.location.origin}/kampanja/${campaignSlug}`;
  const cleanInfluencerName = influencerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return generateUTMLink(baseUrl, {
    utm_source: platform,
    utm_medium: 'paid_social',
    utm_campaign: campaignSlug,
    utm_content: 'paid_ad',
    utm_term: cleanInfluencerName
  });
};

export const generateQRCode = (url: string): string => {
  // Simple QR code generation using QR Server API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  return qrUrl;
};

export const getAllLinksForCampaign = (
  campaignSlug: string,
  influencerName: string,
  platforms: string[]
) => {
  const allLinks: Record<string, any> = {};
  
  platforms.forEach(platform => {
    allLinks[platform] = generateCampaignLinks(campaignSlug, influencerName, platform);
  });
  
  return allLinks;
};
