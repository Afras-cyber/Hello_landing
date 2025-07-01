declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const initializeGTM = (gtmId: string) => {
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Enhanced GTM script with better error handling
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  script1.onerror = () => console.error('Failed to load GTM script');
  
  const script2 = document.createElement('script');
  script2.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
  
  document.head.appendChild(script2);
  document.head.appendChild(script1);
  
  // Set up enhanced ecommerce
  window.dataLayer.push({
    event: 'gtm_enhanced_ecommerce_enabled',
    ecommerce: {
      currencyCode: 'EUR'
    }
  });
};

export const trackBookingEvent = (data: {
  sessionId: string;
  bookingTime: number;
  interactionCount: number;
  source: string;
  value?: number;
  bookingDetails?: any;
}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    // Enhanced Ecommerce Purchase Event
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: data.sessionId,
        value: data.value || 200,
        currency: 'EUR',
        items: [{
          item_id: 'hair_service_booking',
          item_name: 'Hair Service Booking',
          category: 'Hair Services',
          quantity: 1,
          price: data.value || 200
        }]
      },
      // Custom dimensions for detailed analysis
      custom_dimensions: {
        booking_source: data.source,
        session_id: data.sessionId,
        booking_time_seconds: data.bookingTime,
        interaction_count: data.interactionCount,
        conversion_type: 'booking'
      },
      // Additional booking data
      booking_details: data.bookingDetails || {}
    });
    
    // Traditional booking completed event for backwards compatibility
    window.dataLayer.push({
      event: 'booking_completed',
      booking_source: data.source,
      session_id: data.sessionId,
      booking_time: data.bookingTime,
      interaction_count: data.interactionCount,
      event_category: 'conversion',
      event_label: 'timma_booking',
      value: data.value || 200
    });
    
    console.log('GTM: Enhanced booking events tracked', data);
  }
};

export const trackTimmaInteraction = (data: {
  interactionType: string;
  sessionId: string;
  elementText?: string;
  elementSelector?: string;
  coordinates?: { x: number; y: number };
  additionalData?: any;
}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'timma_interaction',
      interaction_type: data.interactionType,
      session_id: data.sessionId,
      element_text: data.elementText,
      element_selector: data.elementSelector,
      click_coordinates: data.coordinates,
      event_category: 'engagement',
      event_label: 'timma_iframe',
      custom_data: data.additionalData || {}
    });
  }
};

export const trackPageView = (pagePath: string, pageTitle: string, additionalData?: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href,
      ...additionalData
    });
  }
};

export const trackFormInteraction = (data: {
  formName: string;
  fieldName: string;
  action: 'focus' | 'blur' | 'change' | 'submit';
  sessionId: string;
  value?: string;
}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'form_interaction',
      form_name: data.formName,
      field_name: data.fieldName,
      form_action: data.action,
      session_id: data.sessionId,
      event_category: 'form',
      event_label: `${data.formName}_${data.fieldName}`,
      field_value: data.action === 'submit' ? data.value : undefined
    });
  }
};

export const trackScrollDepth = (depth: number, sessionId: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'scroll_depth',
      scroll_depth_percent: depth,
      session_id: sessionId,
      page_path: window.location.pathname,
      event_category: 'engagement',
      event_label: `scroll_${depth}_percent`
    });
  }
};

export const trackSessionMilestone = (data: {
  milestone: 'session_start' | 'session_30s' | 'session_60s' | 'session_300s';
  sessionId: string;
  duration: number;
  interactionCount: number;
}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'session_milestone',
      milestone_type: data.milestone,
      session_id: data.sessionId,
      session_duration: data.duration,
      interaction_count: data.interactionCount,
      event_category: 'engagement',
      event_label: data.milestone
    });
  }
};

export const trackBookingProgress = (data: {
  step: string;
  sessionId: string;
  progressPercent: number;
  timeSpent: number;
}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'booking_progress',
      booking_step: data.step,
      session_id: data.sessionId,
      progress_percent: data.progressPercent,
      time_spent_seconds: data.timeSpent,
      event_category: 'booking_funnel',
      event_label: data.step
    });
  }
};

export const trackError = (data: {
  errorType: string;
  errorMessage: string;
  sessionId: string;
  context?: string;
}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'tracking_error',
      error_type: data.errorType,
      error_message: data.errorMessage,
      session_id: data.sessionId,
      error_context: data.context,
      event_category: 'error',
      event_label: data.errorType
    });
  }
};

// Custom event for A/B testing
export const trackABTest = (data: {
  testName: string;
  variant: string;
  sessionId: string;
}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'ab_test_view',
      test_name: data.testName,
      test_variant: data.variant,
      session_id: data.sessionId,
      event_category: 'ab_testing',
      event_label: `${data.testName}_${data.variant}`
    });
  }
};
