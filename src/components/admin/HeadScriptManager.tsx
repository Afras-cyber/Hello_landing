
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Code, Eye, EyeOff } from 'lucide-react';

interface HeadScript {
  id: string;
  name: string;
  script_content: string;
  is_active: boolean;
  script_type: string;
  display_order: number;
  created_at: string;
}

const HeadScriptManager = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingScript, setEditingScript] = useState<HeadScript | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    script_content: '',
    is_active: true,
    display_order: 0
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scripts, isLoading } = useQuery({
    queryKey: ['head-scripts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('head_scripts')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as HeadScript[];
    }
  });

  const createScriptMutation = useMutation({
    mutationFn: async (scriptData: typeof formData) => {
      const { data, error } = await supabase
        .from('head_scripts')
        .insert([{
          ...scriptData,
          script_type: 'custom',
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['head-scripts'] });
      resetForm();
      toast({
        title: "Script lisätty",
        description: "Head script on lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Scriptin lisääminen epäonnistui.",
        variant: "destructive"
      });
    }
  });

  const updateScriptMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeadScript> & { id: string }) => {
      const { data, error } = await supabase
        .from('head_scripts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['head-scripts'] });
      resetForm();
      toast({
        title: "Script päivitetty",
        description: "Head script on päivitetty onnistuneesti.",
      });
    }
  });

  const deleteScriptMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('head_scripts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['head-scripts'] });
      toast({
        title: "Script poistettu",
        description: "Head script on poistettu onnistuneesti.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      script_content: '',
      is_active: true,
      display_order: 0
    });
    setIsEditing(false);
    setEditingScript(null);
  };

  const handleEdit = (script: HeadScript) => {
    setEditingScript(script);
    setFormData({
      name: script.name,
      script_content: script.script_content,
      is_active: script.is_active,
      display_order: script.display_order
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScript) {
      updateScriptMutation.mutate({ id: editingScript.id, ...formData });
    } else {
      createScriptMutation.mutate(formData);
    }
  };

  const toggleScriptStatus = (script: HeadScript) => {
    updateScriptMutation.mutate({ 
      id: script.id, 
      is_active: !script.is_active 
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Ladataan...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="h-5 w-5 text-blondify-blue" />
            {isEditing ? 'Muokkaa Head Scriptiä' : 'Lisää Head Script'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white">Nimi</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Esim. Google Analytics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="display_order" className="text-white">Järjestys</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="script_content" className="text-white">Script Sisältö</Label>
              <Textarea
                id="script_content"
                value={formData.script_content}
                onChange={(e) => setFormData({ ...formData, script_content: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white h-32"
                placeholder="<script>...</script> tai <meta>..."
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label className="text-white">Aktiivinen</Label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="bg-blondify-blue hover:bg-blondify-blue/80"
                disabled={createScriptMutation.isPending || updateScriptMutation.isPending}
              >
                {isEditing ? 'Päivitä' : 'Lisää'}
              </Button>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="border-gray-600 text-gray-300"
                >
                  Peruuta
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Scripts List */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Head Scriptit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scripts?.map((script) => (
              <div key={script.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-white">{script.name}</h3>
                    <Badge variant={script.is_active ? "default" : "secondary"}>
                      {script.is_active ? 'Aktiivinen' : 'Ei aktiivinen'}
                    </Badge>
                    <Badge variant="outline">#{script.display_order}</Badge>
                  </div>
                  <div className="text-sm text-gray-400 font-mono bg-gray-900 p-2 rounded max-h-20 overflow-hidden">
                    {script.script_content.substring(0, 200)}
                    {script.script_content.length > 200 && '...'}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleScriptStatus(script)}
                    className="border-gray-600"
                  >
                    {script.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(script)}
                    className="border-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteScriptMutation.mutate(script.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {(!scripts || scripts.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Code className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p>Ei head scriptejä määritelty</p>
                <p className="text-sm">Lisää ensimmäinen script yllä olevalla lomakkeella</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeadScriptManager;
