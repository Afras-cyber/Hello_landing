
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrackClickRequest {
  campaignId: string;
  redirectId?: string;
  sessionId: string;
  userAgent?: string;
  referrerUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }

  try {
    const requestData: TrackClickRequest = await req.json()
    
    // Input validation
    if (!requestData.campaignId || typeof requestData.campaignId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid campaignId is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    if (!requestData.sessionId || typeof requestData.sessionId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid sessionId is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Validate UUID format for campaignId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(requestData.campaignId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid campaignId format' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Validate redirectId if provided
    if (requestData.redirectId && !uuidRegex.test(requestData.redirectId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid redirectId format' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Tracking affiliate click:', {
      campaignId: requestData.campaignId,
      sessionId: requestData.sessionId,
      ip: clientIP
    })

    // Use the existing track_affiliate_click function for atomic operation
    const { data, error } = await supabase.rpc('track_affiliate_click', {
      campaign_id_param: requestData.campaignId,
      redirect_id_param: requestData.redirectId || null,
      session_id_param: requestData.sessionId,
      user_agent_param: requestData.userAgent || null,
      ip_address_param: clientIP !== 'unknown' ? clientIP : null,
      referrer_url_param: requestData.referrerUrl || null,
      utm_source_param: requestData.utmSource || null,
      utm_medium_param: requestData.utmMedium || null,
      utm_campaign_param: requestData.utmCampaign || null,
      utm_content_param: requestData.utmContent || null,
      utm_term_param: requestData.utmTerm || null
    })

    if (error) {
      console.error('Error tracking affiliate click:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to track click' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    console.log('Affiliate click tracked successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        clickId: data,
        message: 'Click tracked successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  } catch (error) {
    console.error('Error in track-affiliate-click function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})
