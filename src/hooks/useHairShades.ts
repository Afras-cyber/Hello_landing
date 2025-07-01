
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HairShadeCategory = 'cool' | 'warm' | 'neutral';

export interface HairShadeImage {
  url: string;
  alt?: string;
  tempId?: string; // Add tempId for tracking temporary uploads
}

export interface HairShade {
  id: string;
  name: string;
  description: string | null;
  images: HairShadeImage[];
  category: HairShadeCategory;
  display_order: number;
}

// Type guard to check if an object is a valid HairShadeImage
const isHairShadeImage = (obj: any): obj is HairShadeImage => {
  return typeof obj === 'object' && obj !== null && typeof obj.url === 'string';
};

export function useHairShades() {
  return useQuery({
    queryKey: ['hairShades'],
    queryFn: async () => {
      console.log('🔍 Fetching hair shades with proper ordering...');
      
      const { data, error } = await supabase
        .from('hair_shades')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching hair shades:', error);
        throw error;
      }
      
      console.log('✅ Raw hair shades data:', data);
      
      // Type casting to ensure category is one of the allowed values and images are properly typed
      const processedShades = data.map(shade => {
        console.log(`🎨 Processing shade ${shade.name} with display_order: ${shade.display_order}`);
        console.log(`📸 Raw images for ${shade.name}:`, shade.images);
        
        const processedImages = Array.isArray(shade.images) 
          ? (shade.images as unknown[]).filter(isHairShadeImage)
          : [];
          
        console.log(`✅ Processed images for ${shade.name}:`, processedImages);
        
        return {
          ...shade,
          category: shade.category as HairShadeCategory,
          images: processedImages
        };
      }) as HairShade[];
      
      // Sort again to ensure consistent ordering (belt and suspenders approach)
      const sortedShades = processedShades.sort((a, b) => a.display_order - b.display_order);
      
      console.log('🎯 Final sorted shades with display orders:', 
        sortedShades.map(s => `${s.name}: ${s.display_order}`));
      
      return sortedShades;
    }
  });
}
