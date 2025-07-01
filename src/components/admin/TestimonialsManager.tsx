
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Plus, Trash2, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_image?: string;
  testimonial_text: string;
  rating: number;
  service_type?: string;
  location?: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
}

const TestimonialsManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: "Virhe",
        description: "Asiakasarvostelujen hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTestimonial = async (testimonial: Testimonial) => {
    try {
      setSaving(true);
      
      if (testimonial.id.startsWith('temp-')) {
        // Create new testimonial
        const { error } = await supabase
          .from('testimonials')
          .insert({
            customer_name: testimonial.customer_name,
            customer_image: testimonial.customer_image,
            testimonial_text: testimonial.testimonial_text,
            rating: testimonial.rating,
            service_type: testimonial.service_type,
            location: testimonial.location,
            is_featured: testimonial.is_featured,
            is_published: testimonial.is_published,
            display_order: testimonial.display_order
          });
        
        if (error) throw error;
        await fetchTestimonials();
      } else {
        // Update existing testimonial
        const { error } = await supabase
          .from('testimonials')
          .update({
            customer_name: testimonial.customer_name,
            customer_image: testimonial.customer_image,
            testimonial_text: testimonial.testimonial_text,
            rating: testimonial.rating,
            service_type: testimonial.service_type,
            location: testimonial.location,
            is_featured: testimonial.is_featured,
            is_published: testimonial.is_published,
            display_order: testimonial.display_order
          })
          .eq('id', testimonial.id);
        
        if (error) throw error;
      }

      setEditingId(null);
      toast({
        title: "Tallennettu",
        description: "Asiakasarvostelu tallennettu onnistuneesti.",
      });
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        title: "Virhe",
        description: "Tallentaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addNewTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: `temp-${Date.now()}`,
      customer_name: '',
      testimonial_text: '',
      rating: 5,
      is_featured: false,
      is_published: true,
      display_order: testimonials.length
    };
    setTestimonials([...testimonials, newTestimonial]);
    setEditingId(newTestimonial.id);
  };

  const removeTestimonial = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        const { error } = await supabase
          .from('testimonials')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      }
      
      setTestimonials(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Poistettu",
        description: "Asiakasarvostelu poistettu onnistuneesti.",
      });
    } catch (error) {
      console.error('Error removing testimonial:', error);
      toast({
        title: "Virhe",
        description: "Poistaminen epäonnistui.",
        variant: "destructive"
      });
    }
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: any) => {
    setTestimonials(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Asiakasarvostelut</CardTitle>
        <Button onClick={addNewTestimonial}>
          <Plus className="h-4 w-4 mr-2" />
          Lisää arvostelu
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-4">
              {editingId === testimonial.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Asiakkaan nimi</Label>
                      <Input
                        value={testimonial.customer_name}
                        onChange={(e) => updateTestimonial(testimonial.id, 'customer_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Sijainti</Label>
                      <Input
                        value={testimonial.location || ''}
                        onChange={(e) => updateTestimonial(testimonial.id, 'location', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Arvostelu</Label>
                    <Textarea
                      value={testimonial.testimonial_text}
                      onChange={(e) => updateTestimonial(testimonial.id, 'testimonial_text', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Arvosana</Label>
                      <div className="flex items-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => updateTestimonial(testimonial.id, 'rating', star)}
                            className={`p-1 ${star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            <Star className="h-4 w-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Palvelutyyppi</Label>
                      <Input
                        value={testimonial.service_type || ''}
                        onChange={(e) => updateTestimonial(testimonial.id, 'service_type', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Järjestys</Label>
                      <Input
                        type="number"
                        value={testimonial.display_order}
                        onChange={(e) => updateTestimonial(testimonial.id, 'display_order', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={testimonial.is_featured}
                          onCheckedChange={(checked) => updateTestimonial(testimonial.id, 'is_featured', checked)}
                        />
                        <Label>Nostettu esiin</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={testimonial.is_published}
                          onCheckedChange={(checked) => updateTestimonial(testimonial.id, 'is_published', checked)}
                        />
                        <Label>Julkaistu</Label>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Peruuta
                      </Button>
                      <Button
                        onClick={() => saveTestimonial(testimonial)}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Tallenna
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{testimonial.customer_name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{testimonial.testimonial_text}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      {testimonial.is_featured && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Esiin nostettu</span>
                      )}
                      {!testimonial.is_published && (
                        <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">Julkaisematon</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(testimonial.id)}
                    >
                      Muokkaa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTestimonial(testimonial.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsManager;
