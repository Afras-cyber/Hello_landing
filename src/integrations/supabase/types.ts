export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      additional_services: {
        Row: {
          consultation_id: string
          created_at: string
          id: string
          service_type: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          id?: string
          service_type: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          id?: string
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "additional_services_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          browser: string | null
          campaign_id: string | null
          city: string | null
          clicked_at: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          id: string
          ip_address: unknown | null
          redirect_id: string | null
          referrer_url: string | null
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          campaign_id?: string | null
          city?: string | null
          clicked_at?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          redirect_id?: string | null
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          campaign_id?: string | null
          city?: string | null
          clicked_at?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          redirect_id?: string | null
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "affiliate_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_redirect_id_fkey"
            columns: ["redirect_id"]
            isOneToOne: false
            referencedRelation: "campaign_redirects"
            referencedColumns: ["id"]
          },
        ]
      }
      article_images: {
        Row: {
          alt_text: string | null
          article_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          article_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          article_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_images_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          content: string
          created_at: string
          date: string
          excerpt: string
          id: string
          imageurl: string
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          date: string
          excerpt: string
          id?: string
          imageurl: string
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          excerpt?: string
          id?: string
          imageurl?: string
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      best_services_web: {
        Row: {
          created_at: string
          display_order: number
          id: string
          service_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "best_services_web_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          keywords: string | null
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          keywords?: string | null
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          keywords?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_conversions: {
        Row: {
          ad_platform: string | null
          admin_verified_at: string | null
          admin_verified_by: string | null
          booking_attempts: number | null
          booking_confirmation_detected: boolean | null
          booking_page_time: number | null
          campaign_name: string | null
          client_contact_data: Json | null
          confidence_score: number | null
          console_detected: boolean | null
          console_detection_timestamp: string | null
          conversion_source: string | null
          conversion_validated: boolean | null
          created_at: string
          estimated_conversion: boolean | null
          estimated_value: number | null
          form_fills: number | null
          id: string
          iframe_interactions: number | null
          last_interaction_timestamp: string | null
          manually_verified: boolean | null
          session_id: string
          success_indicators: Json | null
          timma_interaction_count: number | null
          traffic_source: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          validated_at: string | null
          validated_by: string | null
          validation_notes: string | null
          verification_notes: string | null
        }
        Insert: {
          ad_platform?: string | null
          admin_verified_at?: string | null
          admin_verified_by?: string | null
          booking_attempts?: number | null
          booking_confirmation_detected?: boolean | null
          booking_page_time?: number | null
          campaign_name?: string | null
          client_contact_data?: Json | null
          confidence_score?: number | null
          console_detected?: boolean | null
          console_detection_timestamp?: string | null
          conversion_source?: string | null
          conversion_validated?: boolean | null
          created_at?: string
          estimated_conversion?: boolean | null
          estimated_value?: number | null
          form_fills?: number | null
          id?: string
          iframe_interactions?: number | null
          last_interaction_timestamp?: string | null
          manually_verified?: boolean | null
          session_id: string
          success_indicators?: Json | null
          timma_interaction_count?: number | null
          traffic_source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          verification_notes?: string | null
        }
        Update: {
          ad_platform?: string | null
          admin_verified_at?: string | null
          admin_verified_by?: string | null
          booking_attempts?: number | null
          booking_confirmation_detected?: boolean | null
          booking_page_time?: number | null
          campaign_name?: string | null
          client_contact_data?: Json | null
          confidence_score?: number | null
          console_detected?: boolean | null
          console_detection_timestamp?: string | null
          conversion_source?: string | null
          conversion_validated?: boolean | null
          created_at?: string
          estimated_conversion?: boolean | null
          estimated_value?: number | null
          form_fills?: number | null
          id?: string
          iframe_interactions?: number | null
          last_interaction_timestamp?: string | null
          manually_verified?: boolean | null
          session_id?: string
          success_indicators?: Json | null
          timma_interaction_count?: number | null
          traffic_source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          verification_notes?: string | null
        }
        Relationships: []
      }
      campaign_conversions: {
        Row: {
          booking_id: string | null
          campaign_id: string | null
          click_id: string | null
          conversion_type: Database["public"]["Enums"]["conversion_type"]
          conversion_value: number | null
          converted_at: string | null
          created_at: string | null
          discount_code_used: string | null
          id: string
          service_type: string | null
          session_id: string | null
        }
        Insert: {
          booking_id?: string | null
          campaign_id?: string | null
          click_id?: string | null
          conversion_type: Database["public"]["Enums"]["conversion_type"]
          conversion_value?: number | null
          converted_at?: string | null
          created_at?: string | null
          discount_code_used?: string | null
          id?: string
          service_type?: string | null
          session_id?: string | null
        }
        Update: {
          booking_id?: string | null
          campaign_id?: string | null
          click_id?: string | null
          conversion_type?: Database["public"]["Enums"]["conversion_type"]
          conversion_value?: number | null
          converted_at?: string | null
          created_at?: string | null
          discount_code_used?: string | null
          id?: string
          service_type?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_conversions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_conversions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_conversions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_conversions_click_id_fkey"
            columns: ["click_id"]
            isOneToOne: false
            referencedRelation: "affiliate_clicks"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_redirects: {
        Row: {
          click_count: number | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          referrer_url: string | null
          source_path: string
          target_path: string
          updated_at: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          referrer_url?: string | null
          source_path: string
          target_path: string
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          referrer_url?: string | null
          source_path?: string
          target_path?: string
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          background_image: string | null
          banner_image: string | null
          booking_calendar_enabled: boolean | null
          campaign_text: string | null
          content_blocks: Json | null
          countdown_end_date: string | null
          created_at: string
          custom_styles: Json | null
          description: string | null
          discount_code: string | null
          exclusive_offers: Json | null
          faq_items: Json | null
          featured_products: Json | null
          gallery_images: Json | null
          hero_video_url: string | null
          id: string
          influencer_bio: string | null
          influencer_name: string | null
          influencer_stats: Json | null
          is_active: boolean | null
          name: string
          partner_logos: Json | null
          pricing_table: Json | null
          profile_image: string | null
          recommended_services: Json | null
          redirect_url: string | null
          selected_services: string[] | null
          slug: string | null
          social_media_urls: Json | null
          testimonials: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          background_image?: string | null
          banner_image?: string | null
          booking_calendar_enabled?: boolean | null
          campaign_text?: string | null
          content_blocks?: Json | null
          countdown_end_date?: string | null
          created_at?: string
          custom_styles?: Json | null
          description?: string | null
          discount_code?: string | null
          exclusive_offers?: Json | null
          faq_items?: Json | null
          featured_products?: Json | null
          gallery_images?: Json | null
          hero_video_url?: string | null
          id?: string
          influencer_bio?: string | null
          influencer_name?: string | null
          influencer_stats?: Json | null
          is_active?: boolean | null
          name: string
          partner_logos?: Json | null
          pricing_table?: Json | null
          profile_image?: string | null
          recommended_services?: Json | null
          redirect_url?: string | null
          selected_services?: string[] | null
          slug?: string | null
          social_media_urls?: Json | null
          testimonials?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          background_image?: string | null
          banner_image?: string | null
          booking_calendar_enabled?: boolean | null
          campaign_text?: string | null
          content_blocks?: Json | null
          countdown_end_date?: string | null
          created_at?: string
          custom_styles?: Json | null
          description?: string | null
          discount_code?: string | null
          exclusive_offers?: Json | null
          faq_items?: Json | null
          featured_products?: Json | null
          gallery_images?: Json | null
          hero_video_url?: string | null
          id?: string
          influencer_bio?: string | null
          influencer_name?: string | null
          influencer_stats?: Json | null
          is_active?: boolean | null
          name?: string
          partner_logos?: Json | null
          pricing_table?: Json | null
          profile_image?: string | null
          recommended_services?: Json | null
          redirect_url?: string | null
          selected_services?: string[] | null
          slug?: string | null
          social_media_urls?: Json | null
          testimonials?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      careers: {
        Row: {
          created_at: string
          description: string
          id: string
          location: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          location: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          location?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultation_autosaves: {
        Row: {
          accepted_at: string | null
          additional_services: string[] | null
          afterPhotoUrl: string | null
          brightening_degree: string | null
          brightness_level: number | null
          clientId: string | null
          color: string | null
          comment: string | null
          consultation_id: string | null
          created_at: string
          current_step: number | null
          current_step_name: string | null
          currentStep: number | null
          customer_id: string | null
          customer_name: string | null
          customerName: string | null
          date: string
          final_feedback: Json | null
          final_photo_url: string | null
          finishing_style: string | null
          hairstyle: string | null
          has_metallics: boolean | null
          id: string
          intensity: string | null
          is_completed: boolean | null
          is_refresh: boolean | null
          is_skipped: boolean | null
          k18_selected: boolean | null
          last_color: string | null
          last_visit: string | null
          lighting_level: string | null
          location: string | null
          locked_at: string | null
          metallic_condition: string | null
          photo_points: Json | null
          photo_url: string | null
          photos: Json | null
          selected_image_id: string | null
          selected_service: string | null
          selected_shades: string[] | null
          service_category: string | null
          service_comments: Json | null
          service_techniques: string[] | null
          shade_comments: Json | null
          status: string | null
          surface: string | null
          surface_condition: string | null
          temperature: string | null
          terms_accepted: boolean | null
          type: string | null
        }
        Insert: {
          accepted_at?: string | null
          additional_services?: string[] | null
          afterPhotoUrl?: string | null
          brightening_degree?: string | null
          brightness_level?: number | null
          clientId?: string | null
          color?: string | null
          comment?: string | null
          consultation_id?: string | null
          created_at?: string
          current_step?: number | null
          current_step_name?: string | null
          currentStep?: number | null
          customer_id?: string | null
          customer_name?: string | null
          customerName?: string | null
          date?: string
          final_feedback?: Json | null
          final_photo_url?: string | null
          finishing_style?: string | null
          hairstyle?: string | null
          has_metallics?: boolean | null
          id?: string
          intensity?: string | null
          is_completed?: boolean | null
          is_refresh?: boolean | null
          is_skipped?: boolean | null
          k18_selected?: boolean | null
          last_color?: string | null
          last_visit?: string | null
          lighting_level?: string | null
          location?: string | null
          locked_at?: string | null
          metallic_condition?: string | null
          photo_points?: Json | null
          photo_url?: string | null
          photos?: Json | null
          selected_image_id?: string | null
          selected_service?: string | null
          selected_shades?: string[] | null
          service_category?: string | null
          service_comments?: Json | null
          service_techniques?: string[] | null
          shade_comments?: Json | null
          status?: string | null
          surface?: string | null
          surface_condition?: string | null
          temperature?: string | null
          terms_accepted?: boolean | null
          type?: string | null
        }
        Update: {
          accepted_at?: string | null
          additional_services?: string[] | null
          afterPhotoUrl?: string | null
          brightening_degree?: string | null
          brightness_level?: number | null
          clientId?: string | null
          color?: string | null
          comment?: string | null
          consultation_id?: string | null
          created_at?: string
          current_step?: number | null
          current_step_name?: string | null
          currentStep?: number | null
          customer_id?: string | null
          customer_name?: string | null
          customerName?: string | null
          date?: string
          final_feedback?: Json | null
          final_photo_url?: string | null
          finishing_style?: string | null
          hairstyle?: string | null
          has_metallics?: boolean | null
          id?: string
          intensity?: string | null
          is_completed?: boolean | null
          is_refresh?: boolean | null
          is_skipped?: boolean | null
          k18_selected?: boolean | null
          last_color?: string | null
          last_visit?: string | null
          lighting_level?: string | null
          location?: string | null
          locked_at?: string | null
          metallic_condition?: string | null
          photo_points?: Json | null
          photo_url?: string | null
          photos?: Json | null
          selected_image_id?: string | null
          selected_service?: string | null
          selected_shades?: string[] | null
          service_category?: string | null
          service_comments?: Json | null
          service_techniques?: string[] | null
          shade_comments?: Json | null
          status?: string | null
          surface?: string | null
          surface_condition?: string | null
          temperature?: string | null
          terms_accepted?: boolean | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_autosaves_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_autosaves_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_data: {
        Row: {
          consultation_id: string
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          consultation_id: string
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          consultation_id?: string
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "consultation_data_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_flows: {
        Row: {
          client_id: string | null
          created_at: string
          current_step: string
          id: string
          locked_at: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          current_step?: string
          id?: string
          locked_at?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          current_step?: string
          id?: string
          locked_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_flows_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_photos: {
        Row: {
          consultation_id: string
          created_at: string
          id: string
          photo_type: string
          photo_url: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          id?: string
          photo_type: string
          photo_url: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          id?: string
          photo_type?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_photos_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          accepted_at: string | null
          additional_services: string[] | null
          brightening_degree: string | null
          brightness_level: number | null
          color: string | null
          comment: string | null
          created_at: string
          current_step: number | null
          customer_id: string
          customer_name: string | null
          date: string
          final_feedback: Json | null
          final_photo_url: string | null
          finishing_style: string | null
          hairstyle: string | null
          has_metallics: boolean | null
          id: string
          intensity: string | null
          is_completed: boolean | null
          is_refresh: boolean | null
          is_skipped: boolean | null
          k18_selected: boolean | null
          last_color: string | null
          last_visit: string | null
          lighting_level: string | null
          location: string | null
          locked_at: string | null
          metallic_condition: string | null
          photo_points: Json | null
          photo_url: string | null
          selected_image_id: string | null
          selected_service: string | null
          selected_shades: string[] | null
          service_category: string | null
          service_comments: Json | null
          service_techniques: string[] | null
          shade_comments: Json | null
          status: string | null
          surface: string | null
          surface_condition: string | null
          temperature: string | null
          terms_accepted: boolean | null
        }
        Insert: {
          accepted_at?: string | null
          additional_services?: string[] | null
          brightening_degree?: string | null
          brightness_level?: number | null
          color?: string | null
          comment?: string | null
          created_at?: string
          current_step?: number | null
          customer_id: string
          customer_name?: string | null
          date?: string
          final_feedback?: Json | null
          final_photo_url?: string | null
          finishing_style?: string | null
          hairstyle?: string | null
          has_metallics?: boolean | null
          id?: string
          intensity?: string | null
          is_completed?: boolean | null
          is_refresh?: boolean | null
          is_skipped?: boolean | null
          k18_selected?: boolean | null
          last_color?: string | null
          last_visit?: string | null
          lighting_level?: string | null
          location?: string | null
          locked_at?: string | null
          metallic_condition?: string | null
          photo_points?: Json | null
          photo_url?: string | null
          selected_image_id?: string | null
          selected_service?: string | null
          selected_shades?: string[] | null
          service_category?: string | null
          service_comments?: Json | null
          service_techniques?: string[] | null
          shade_comments?: Json | null
          status?: string | null
          surface?: string | null
          surface_condition?: string | null
          temperature?: string | null
          terms_accepted?: boolean | null
        }
        Update: {
          accepted_at?: string | null
          additional_services?: string[] | null
          brightening_degree?: string | null
          brightness_level?: number | null
          color?: string | null
          comment?: string | null
          created_at?: string
          current_step?: number | null
          customer_id?: string
          customer_name?: string | null
          date?: string
          final_feedback?: Json | null
          final_photo_url?: string | null
          finishing_style?: string | null
          hairstyle?: string | null
          has_metallics?: boolean | null
          id?: string
          intensity?: string | null
          is_completed?: boolean | null
          is_refresh?: boolean | null
          is_skipped?: boolean | null
          k18_selected?: boolean | null
          last_color?: string | null
          last_visit?: string | null
          lighting_level?: string | null
          location?: string | null
          locked_at?: string | null
          metallic_condition?: string | null
          photo_points?: Json | null
          photo_url?: string | null
          selected_image_id?: string | null
          selected_service?: string | null
          selected_shades?: string[] | null
          service_category?: string | null
          service_comments?: Json | null
          service_techniques?: string[] | null
          shade_comments?: Json | null
          status?: string | null
          surface?: string | null
          surface_condition?: string | null
          temperature?: string | null
          terms_accepted?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          content: Json
          created_at: string
          id: string
          name: string
          published: boolean | null
          type: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          name: string
          published?: boolean | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          name?: string
          published?: boolean | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_journey: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          id: string
          journey_step: string
          page_url: string | null
          referrer_url: string | null
          session_id: string
          step_data: Json | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          journey_step: string
          page_url?: string | null
          referrer_url?: string | null
          session_id: string
          step_data?: Json | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          journey_step?: string
          page_url?: string | null
          referrer_url?: string | null
          session_id?: string
          step_data?: Json | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      email_bookings: {
        Row: {
          booking_datetime: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          email_body: string | null
          email_subject: string | null
          id: string
          parsed_at: string | null
          services: string[] | null
          session_id: string | null
          staff_member: string | null
          total_amount: number | null
        }
        Insert: {
          booking_datetime?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          email_body?: string | null
          email_subject?: string | null
          id?: string
          parsed_at?: string | null
          services?: string[] | null
          session_id?: string | null
          staff_member?: string | null
          total_amount?: number | null
        }
        Update: {
          booking_datetime?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          email_body?: string | null
          email_subject?: string | null
          id?: string
          parsed_at?: string | null
          services?: string[] | null
          session_id?: string | null
          staff_member?: string | null
          total_amount?: number | null
        }
        Relationships: []
      }
      employee_performance: {
        Row: {
          confidence_level: number | null
          consultation_id: string
          created_at: string | null
          employee_id: string
          feedback: string | null
          id: string
          recipe_success: boolean | null
        }
        Insert: {
          confidence_level?: number | null
          consultation_id: string
          created_at?: string | null
          employee_id: string
          feedback?: string | null
          id?: string
          recipe_success?: boolean | null
        }
        Update: {
          confidence_level?: number | null
          consultation_id?: string
          created_at?: string | null
          employee_id?: string
          feedback?: string | null
          id?: string
          recipe_success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_performance_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_performance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "seller_pins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_performance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "user_maintenance_status"
            referencedColumns: ["user_id"]
          },
        ]
      }
      enhanced_booking_details: {
        Row: {
          accept_email_marketing: boolean | null
          accept_sms_marketing: boolean | null
          appointment_date: string | null
          appointment_time: string | null
          booking_date: string | null
          cancellation_policy: string | null
          client_address: string | null
          client_city: string | null
          client_message: string | null
          client_postal_code: string | null
          console_detection_method: string | null
          console_raw_data: Json | null
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_email: string | null
          customer_message: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_postal_code: string | null
          extracted_text: string | null
          id: string
          location: string | null
          raw_ocr_data: Json | null
          service_names: string[] | null
          service_prices: number[] | null
          session_id: string
          social_security_number: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          accept_email_marketing?: boolean | null
          accept_sms_marketing?: boolean | null
          appointment_date?: string | null
          appointment_time?: string | null
          booking_date?: string | null
          cancellation_policy?: string | null
          client_address?: string | null
          client_city?: string | null
          client_message?: string | null
          client_postal_code?: string | null
          console_detection_method?: string | null
          console_raw_data?: Json | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_message?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_postal_code?: string | null
          extracted_text?: string | null
          id?: string
          location?: string | null
          raw_ocr_data?: Json | null
          service_names?: string[] | null
          service_prices?: number[] | null
          session_id: string
          social_security_number?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          accept_email_marketing?: boolean | null
          accept_sms_marketing?: boolean | null
          appointment_date?: string | null
          appointment_time?: string | null
          booking_date?: string | null
          cancellation_policy?: string | null
          client_address?: string | null
          client_city?: string | null
          client_message?: string | null
          client_postal_code?: string | null
          console_detection_method?: string | null
          console_raw_data?: Json | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_message?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_postal_code?: string | null
          extracted_text?: string | null
          id?: string
          location?: string | null
          raw_ocr_data?: Json | null
          service_names?: string[] | null
          service_prices?: number[] | null
          session_id?: string
          social_security_number?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          display_order: number | null
          id: string
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      hair_shades: {
        Row: {
          category: string
          description: string | null
          display_order: number
          id: string
          images: Json | null
          name: string
        }
        Insert: {
          category: string
          description?: string | null
          display_order?: number
          id: string
          images?: Json | null
          name: string
        }
        Update: {
          category?: string
          description?: string | null
          display_order?: number
          id?: string
          images?: Json | null
          name?: string
        }
        Relationships: []
      }
      head_scripts: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          script_content: string
          script_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          script_content: string
          script_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          script_content?: string
          script_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      heat_map_data: {
        Row: {
          click_count: number | null
          created_at: string
          date: string
          device_type: string | null
          element_selector: string | null
          id: string
          page_url: string
          updated_at: string
          x_coordinate: number
          y_coordinate: number
        }
        Insert: {
          click_count?: number | null
          created_at?: string
          date?: string
          device_type?: string | null
          element_selector?: string | null
          id?: string
          page_url: string
          updated_at?: string
          x_coordinate: number
          y_coordinate: number
        }
        Update: {
          click_count?: number | null
          created_at?: string
          date?: string
          device_type?: string | null
          element_selector?: string | null
          id?: string
          page_url?: string
          updated_at?: string
          x_coordinate?: number
          y_coordinate?: number
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          background_url: string | null
          button_text: string | null
          color_scheme: Json | null
          content: Json
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          layout_settings: Json | null
          link_url: string | null
          section_name: string
          updated_at: string
        }
        Insert: {
          background_url?: string | null
          button_text?: string | null
          color_scheme?: Json | null
          content?: Json
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          layout_settings?: Json | null
          link_url?: string | null
          section_name: string
          updated_at?: string
        }
        Update: {
          background_url?: string | null
          button_text?: string | null
          color_scheme?: Json | null
          content?: Json
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          layout_settings?: Json | null
          link_url?: string | null
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      iframe_interactions: {
        Row: {
          booking_step: string | null
          confidence_level: number | null
          created_at: string | null
          element_selector: string | null
          element_text: string | null
          id: string
          iframe_url: string | null
          interaction_data: Json | null
          interaction_type: string
          is_booking_related: boolean | null
          session_id: string
          timestamp_offset: number
          x_coordinate: number | null
          y_coordinate: number | null
        }
        Insert: {
          booking_step?: string | null
          confidence_level?: number | null
          created_at?: string | null
          element_selector?: string | null
          element_text?: string | null
          id?: string
          iframe_url?: string | null
          interaction_data?: Json | null
          interaction_type: string
          is_booking_related?: boolean | null
          session_id: string
          timestamp_offset: number
          x_coordinate?: number | null
          y_coordinate?: number | null
        }
        Update: {
          booking_step?: string | null
          confidence_level?: number | null
          created_at?: string | null
          element_selector?: string | null
          element_text?: string | null
          id?: string
          iframe_url?: string | null
          interaction_data?: Json | null
          interaction_type?: string
          is_booking_related?: boolean | null
          session_id?: string
          timestamp_offset?: number
          x_coordinate?: number | null
          y_coordinate?: number | null
        }
        Relationships: []
      }
      influencer_performance: {
        Row: {
          campaign_id: string | null
          commission_rate: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          influencer_name: string
          period_end: string | null
          period_start: string | null
          total_clicks: number | null
          total_commission: number | null
          total_conversions: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          commission_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          influencer_name: string
          period_end?: string | null
          period_start?: string | null
          total_clicks?: number | null
          total_commission?: number | null
          total_conversions?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          commission_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          influencer_name?: string
          period_end?: string | null
          period_start?: string | null
          total_clicks?: number | null
          total_commission?: number | null
          total_conversions?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "influencer_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencer_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_settings: {
        Row: {
          estimated_completion: string | null
          id: string
          is_enabled: boolean | null
          message: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          estimated_completion?: string | null
          id?: string
          is_enabled?: boolean | null
          message?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          estimated_completion?: string | null
          id?: string
          is_enabled?: boolean | null
          message?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          height: number | null
          id: string
          related_id: string | null
          title: string | null
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          related_id?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          related_id?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string
          display_order: number
          icon_name: string | null
          id: string
          is_active: boolean
          label: string
          parent_id: string | null
          target: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean
          label: string
          parent_id?: string | null
          target?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean
          label?: string
          parent_id?: string | null
          target?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_settings: {
        Row: {
          brevo_list_id: number
          button_text: string | null
          created_at: string
          delay_seconds: number
          description: string
          id: string
          image_url: string | null
          is_enabled: boolean
          success_message: string | null
          title: string
          updated_at: string
        }
        Insert: {
          brevo_list_id?: number
          button_text?: string | null
          created_at?: string
          delay_seconds?: number
          description?: string
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          success_message?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          brevo_list_id?: number
          button_text?: string | null
          created_at?: string
          delay_seconds?: number
          description?: string
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          success_message?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          brevo_contact_id: string | null
          brevo_list_id: number | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          subscription_date: string
          subscription_source: string | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          brevo_contact_id?: string | null
          brevo_list_id?: number | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          subscription_date?: string
          subscription_source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          brevo_contact_id?: string | null
          brevo_list_id?: number | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          subscription_date?: string
          subscription_source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      opening_hours: {
        Row: {
          closing_time: string | null
          created_at: string
          day_of_week: string
          display_order: number
          id: string
          is_closed: boolean
          opening_time: string | null
          updated_at: string
        }
        Insert: {
          closing_time?: string | null
          created_at?: string
          day_of_week: string
          display_order?: number
          id?: string
          is_closed?: boolean
          opening_time?: string | null
          updated_at?: string
        }
        Update: {
          closing_time?: string | null
          created_at?: string
          day_of_week?: string
          display_order?: number
          id?: string
          is_closed?: boolean
          opening_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_published: boolean
          meta_description: string | null
          meta_keywords: string | null
          page_slug: string
          page_title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          page_slug: string
          page_title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          page_slug?: string
          page_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          content: Json
          content_type: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          page_id: string | null
          section_key: string
          section_name: string
          updated_at: string
        }
        Insert: {
          content?: Json
          content_type?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          page_id?: string | null
          section_key: string
          section_name: string
          updated_at?: string
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          page_id?: string | null
          section_key?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_system_page: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_system_page?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_system_page?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          specialist_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          specialist_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          specialist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_testimonials: {
        Row: {
          created_at: string
          customer_age: number | null
          customer_name: string
          id: string
          image_url: string
          specialist_id: string
          testimonial_text: string
        }
        Insert: {
          created_at?: string
          customer_age?: number | null
          customer_name: string
          id?: string
          image_url: string
          specialist_id: string
          testimonial_text: string
        }
        Update: {
          created_at?: string
          customer_age?: number | null
          customer_name?: string
          id?: string
          image_url?: string
          specialist_id?: string
          testimonial_text?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          campaign_id: string | null
          code: string
          created_at: string | null
          current_uses: number | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          influencer_name: string | null
          is_active: boolean | null
          max_uses: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          influencer_name?: string | null
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          influencer_name?: string | null
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "referral_codes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_codes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_locations: {
        Row: {
          address: string
          city: string
          created_at: string
          description: string | null
          display_order: number
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          opening_hours: Json | null
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          description?: string | null
          display_order?: number
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          latitude: number
          longitude: number
          name: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          description?: string | null
          display_order?: number
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seller_pins: {
        Row: {
          created_at: string
          id: string
          name: string
          pin: string
          role: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          pin: string
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          pin?: string
          role?: string | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          has_landing_page: boolean | null
          id: string
          image_path: string | null
          landing_page_content: Json | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          name: string
          price: string | null
          service_type: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          has_landing_page?: boolean | null
          id?: string
          image_path?: string | null
          landing_page_content?: Json | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          name: string
          price?: string | null
          service_type?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          has_landing_page?: boolean | null
          id?: string
          image_path?: string | null
          landing_page_content?: Json | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          name?: string
          price?: string | null
          service_type?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      session_events: {
        Row: {
          created_at: string
          element_selector: string | null
          element_text: string | null
          event_data: Json
          event_type: string
          id: string
          page_url: string | null
          session_id: string
          timestamp_offset: number
          x_coordinate: number | null
          y_coordinate: number | null
        }
        Insert: {
          created_at?: string
          element_selector?: string | null
          element_text?: string | null
          event_data: Json
          event_type: string
          id?: string
          page_url?: string | null
          session_id: string
          timestamp_offset: number
          x_coordinate?: number | null
          y_coordinate?: number | null
        }
        Update: {
          created_at?: string
          element_selector?: string | null
          element_text?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          page_url?: string | null
          session_id?: string
          timestamp_offset?: number
          x_coordinate?: number | null
          y_coordinate?: number | null
        }
        Relationships: []
      }
      session_recordings: {
        Row: {
          conversion_keywords: Json | null
          created_at: string | null
          extracted_prices: Json | null
          file_path: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          ocr_confidence: number | null
          ocr_text: string | null
          page_url: string | null
          recording_type: string
          screenshot_analysis: Json | null
          session_id: string
          timestamp_offset: number | null
        }
        Insert: {
          conversion_keywords?: Json | null
          created_at?: string | null
          extracted_prices?: Json | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          ocr_confidence?: number | null
          ocr_text?: string | null
          page_url?: string | null
          recording_type: string
          screenshot_analysis?: Json | null
          session_id: string
          timestamp_offset?: number | null
        }
        Update: {
          conversion_keywords?: Json | null
          created_at?: string | null
          extracted_prices?: Json | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          ocr_confidence?: number | null
          ocr_text?: string | null
          page_url?: string | null
          recording_type?: string
          screenshot_analysis?: Json | null
          session_id?: string
          timestamp_offset?: number | null
        }
        Relationships: []
      }
      session_replays: {
        Row: {
          chunk_index: number
          created_at: string
          id: string
          replay_data: Json
          session_id: string
        }
        Insert: {
          chunk_index?: number
          created_at?: string
          id?: string
          replay_data: Json
          session_id: string
        }
        Update: {
          chunk_index?: number
          created_at?: string
          id?: string
          replay_data?: Json
          session_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      specialist_testimonials: {
        Row: {
          created_at: string
          customer_age: number | null
          customer_name: string
          display_order: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          specialist_id: string
          testimonial_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_age?: number | null
          customer_name: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          specialist_id: string
          testimonial_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_age?: number | null
          customer_name?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          specialist_id?: string
          testimonial_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          badges: string[] | null
          bio: string | null
          id: string
          image_path: string
          is_active: boolean | null
          location: string | null
          name: string
          rating: number | null
          reviews: number | null
          role: string
          specialties: string[] | null
          video_url: string | null
        }
        Insert: {
          badges?: string[] | null
          bio?: string | null
          id: string
          image_path: string
          is_active?: boolean | null
          location?: string | null
          name: string
          rating?: number | null
          reviews?: number | null
          role: string
          specialties?: string[] | null
          video_url?: string | null
        }
        Update: {
          badges?: string[] | null
          bio?: string | null
          id?: string
          image_path?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          rating?: number | null
          reviews?: number | null
          role?: string
          specialties?: string[] | null
          video_url?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          customer_image: string | null
          customer_name: string
          display_order: number
          id: string
          is_featured: boolean
          is_published: boolean
          location: string | null
          rating: number | null
          service_type: string | null
          testimonial_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_image?: string | null
          customer_name: string
          display_order?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          rating?: number | null
          service_type?: string | null
          testimonial_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_image?: string | null
          customer_name?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          rating?: number | null
          service_type?: string | null
          testimonial_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      timma_pro_metrics: {
        Row: {
          created_at: string | null
          extracted_at: string | null
          id: string
          metric_date: string
          service_breakdown: Json | null
          staff_performance: Json | null
          total_bookings: number | null
          total_revenue: number | null
        }
        Insert: {
          created_at?: string | null
          extracted_at?: string | null
          id?: string
          metric_date: string
          service_breakdown?: Json | null
          staff_performance?: Json | null
          total_bookings?: number | null
          total_revenue?: number | null
        }
        Update: {
          created_at?: string | null
          extracted_at?: string | null
          id?: string
          metric_date?: string
          service_breakdown?: Json | null
          staff_performance?: Json | null
          total_bookings?: number | null
          total_revenue?: number | null
        }
        Relationships: []
      }
      unified_portfolio: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_featured: boolean
          source_type: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_featured?: boolean
          source_type: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_featured?: boolean
          source_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          conversion_value: number | null
          country: string | null
          created_at: string
          device_type: string | null
          ended_at: string | null
          id: string
          ip_address: unknown | null
          is_conversion: boolean | null
          page_views: number | null
          referrer_url: string | null
          session_id: string
          started_at: string
          total_duration: number | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          conversion_value?: number | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_conversion?: boolean | null
          page_views?: number | null
          referrer_url?: string | null
          session_id: string
          started_at?: string
          total_duration?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          conversion_value?: number | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_conversion?: boolean | null
          page_views?: number | null
          referrer_url?: string | null
          session_id?: string
          started_at?: string
          total_duration?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      campaign_analytics_summary: {
        Row: {
          campaign_id: string | null
          campaign_name: string | null
          clicks_last_24h: number | null
          conversion_rate: number | null
          conversions_last_24h: number | null
          influencer_name: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_revenue: number | null
          unique_visitors: number | null
        }
        Relationships: []
      }
      campaign_analytics_view: {
        Row: {
          campaign: string | null
          confirmed_bookings: number | null
          conversion_rate: number | null
          date: string | null
          estimated_bookings: number | null
          medium: string | null
          source: string | null
          total_sessions: number | null
        }
        Relationships: []
      }
      campaign_performance: {
        Row: {
          conversion_rate: number | null
          id: string | null
          influencer_name: string | null
          is_active: boolean | null
          name: string | null
          slug: string | null
          total_clicks: number | null
          total_conversions: number | null
        }
        Relationships: []
      }
      consultation_statistics: {
        Row: {
          colors: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          finishing_styles: string[] | null
          first_visit: string | null
          hairstyles: string | null
          last_visit: string | null
          new_consultations: number | null
          refresh_consultations: number | null
          total_consultations: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_analytics_summary: {
        Row: {
          confirmed_bookings: number | null
          date: string | null
          direct_sessions: number | null
          estimated_bookings: number | null
          google_ads_sessions: number | null
          meta_sessions: number | null
          organic_sessions: number | null
          tiktok_sessions: number | null
          total_sessions: number | null
        }
        Relationships: []
      }
      user_maintenance_status: {
        Row: {
          estimated_completion: string | null
          maintenance_active: boolean | null
          maintenance_message: string | null
          role: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          estimated_completion?: never
          maintenance_active?: never
          maintenance_message?: never
          role?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          estimated_completion?: never
          maintenance_active?: never
          maintenance_message?: never
          role?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_screenshot_conversion: {
        Args: {
          p_session_id: string
          p_screenshot_path: string
          p_ocr_text: string
          p_extracted_data?: Json
        }
        Returns: string
      }
      estimate_booking_conversion: {
        Args: {
          p_session_id: string
          p_booking_page_time: number
          p_iframe_interactions: number
          p_form_fills: number
        }
        Returns: number
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_consultation_data: {
        Args: { consultation_id: string }
        Returns: Json
      }
      get_customer_journey_data: {
        Args: { session_ids: string[] }
        Returns: {
          id: string
          session_id: string
          journey_step: string
          page_url: string
          referrer_url: string
          utm_source: string
          utm_medium: string
          utm_campaign: string
          device_type: string
          browser: string
          step_data: Json
          created_at: string
        }[]
      }
      get_enhanced_booking_details: {
        Args: { session_ids: string[] }
        Returns: {
          session_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          service_names: string[]
          total_amount: number
          booking_date: string
          appointment_date: string
        }[]
      }
      get_homepage_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          section_name: string
          content: Json
          is_active: boolean
          display_order: number
          image_url: string
          background_url: string
          link_url: string
          button_text: string
          color_scheme: Json
          layout_settings: Json
        }[]
      }
      get_session_journey: {
        Args: { p_session_id: string }
        Returns: {
          id: string
          session_id: string
          journey_step: string
          page_url: string
          referrer_url: string
          utm_source: string
          utm_medium: string
          utm_campaign: string
          device_type: string
          browser: string
          step_data: Json
          created_at: string
        }[]
      }
      get_validated_timma_conversions: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          session_id: string
          created_at: string
          confidence_score: number
          booking_confirmation_detected: boolean
          estimated_conversion: boolean
          manually_verified: boolean
          iframe_interactions: number
          booking_page_time: number
          utm_source: string
          utm_medium: string
          utm_campaign: string
        }[]
      }
      increment_redirect_click_count: {
        Args: { source_path_param: string }
        Returns: undefined
      }
      increment_referral_code_usage: {
        Args: { code_param: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      migrate_services_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      parse_email_booking: {
        Args: {
          p_email_subject: string
          p_email_body: string
          p_session_id?: string
        }
        Returns: string
      }
      process_console_booking_detection: {
        Args: {
          p_session_id: string
          p_console_data: Json
          p_detection_method?: string
        }
        Returns: string
      }
      save_session_screenshot: {
        Args: {
          p_session_id: string
          p_file_path: string
          p_page_url: string
          p_timestamp_offset?: number
          p_metadata?: Json
          p_file_size?: number
        }
        Returns: string
      }
      track_affiliate_click: {
        Args: {
          campaign_id_param: string
          redirect_id_param: string
          session_id_param: string
          user_agent_param?: string
          ip_address_param?: unknown
          referrer_url_param?: string
          utm_source_param?: string
          utm_medium_param?: string
          utm_campaign_param?: string
          utm_content_param?: string
          utm_term_param?: string
        }
        Returns: string
      }
      track_iframe_interaction: {
        Args: {
          p_session_id: string
          p_interaction_type: string
          p_element_selector?: string
          p_element_text?: string
          p_x_coordinate?: number
          p_y_coordinate?: number
          p_timestamp_offset?: number
          p_iframe_url?: string
          p_interaction_data?: Json
        }
        Returns: string
      }
      track_session_event: {
        Args: {
          p_session_id: string
          p_event_type: string
          p_page_url?: string
          p_element_selector?: string
          p_element_text?: string
          p_event_data?: Json
          p_timestamp_offset?: number
        }
        Returns: string
      }
      update_heat_map_data: {
        Args: {
          p_page_url: string
          p_element_selector: string
          p_x_coordinate: number
          p_y_coordinate: number
          p_device_type: string
        }
        Returns: undefined
      }
      validate_timma_conversion: {
        Args: {
          conversion_id: string
          is_valid: boolean
          notes?: string
          validator_id?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      conversion_type: "click" | "booking" | "consultation" | "purchase"
      traffic_source:
        | "instagram"
        | "tiktok"
        | "youtube"
        | "website"
        | "direct"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conversion_type: ["click", "booking", "consultation", "purchase"],
      traffic_source: [
        "instagram",
        "tiktok",
        "youtube",
        "website",
        "direct",
        "other",
      ],
    },
  },
} as const
