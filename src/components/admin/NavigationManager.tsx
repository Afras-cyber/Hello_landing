
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Plus, Trash2, GripVertical } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  display_order: number;
  is_active: boolean;
  target: string;
  icon_name?: string;
}

const NavigationManager: React.FC = () => {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNavigationItems();
  }, []);

  const fetchNavigationItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching navigation items:', error);
      toast({
        title: "Virhe",
        description: "Navigaation hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNavigationItems = async () => {
    try {
      setSaving(true);
      
      // Update all items with their current state
      for (const item of items) {
        const { error } = await supabase
          .from('navigation_items')
          .update({
            label: item.label,
            url: item.url,
            display_order: item.display_order,
            is_active: item.is_active,
            target: item.target,
            icon_name: item.icon_name
          })
          .eq('id', item.id);
        
        if (error) throw error;
      }

      toast({
        title: "Tallennettu",
        description: "Navigaatio tallennettu onnistuneesti.",
      });
    } catch (error) {
      console.error('Error saving navigation items:', error);
      toast({
        title: "Virhe",
        description: "Tallentaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addNewItem = () => {
    const newItem: NavigationItem = {
      id: `temp-${Date.now()}`,
      label: 'Uusi linkki',
      url: '/',
      display_order: items.length,
      is_active: true,
      target: '_self'
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof NavigationItem, value: any) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        const { error } = await supabase
          .from('navigation_items')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      }
      
      setItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Poistettu",
        description: "Navigaatio-item poistettu onnistuneesti.",
      });
    } catch (error) {
      console.error('Error removing navigation item:', error);
      toast({
        title: "Virhe",
        description: "Poistaminen epäonnistui.",
        variant: "destructive"
      });
    }
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
        <CardTitle>Navigaation hallinta</CardTitle>
        <div className="flex space-x-2">
          <Button onClick={addNewItem} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Lisää linkki
          </Button>
          <Button onClick={saveNavigationItems} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Tallenna
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id} className="p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1 flex items-center">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                <div className="col-span-3">
                  <Label>Nimi</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Label>URL</Label>
                  <Input
                    value={item.url}
                    onChange={(e) => updateItem(item.id, 'url', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Järjestys</Label>
                  <Input
                    type="number"
                    value={item.display_order}
                    onChange={(e) => updateItem(item.id, 'display_order', parseInt(e.target.value))}
                  />
                </div>
                <div className="col-span-1 flex items-center">
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={(checked) => updateItem(item.id, 'is_active', checked)}
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationManager;
