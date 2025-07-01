
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useFaqItems } from '@/hooks/useFaqItems';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, HelpCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  display_order: number;
}

const AdminFAQManager = () => {
  const { data: faqItems, isLoading } = useFaqItems();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'ukk'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string; category: string }) => {
      const maxOrder = faqItems?.length ? Math.max(...faqItems.map(item => item.display_order)) : 0;
      
      const { error } = await supabase
        .from('faq_items')
        .insert({
          question: data.question,
          answer: data.answer,
          category: data.category,
          display_order: maxOrder + 1
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq-items'] });
      setIsAdding(false);
      setFormData({ question: '', answer: '', category: 'ukk' });
      toast({
        title: "Kysymys lisätty",
        description: "FAQ-kysymys on lisätty onnistuneesti."
      });
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: "Kysymyksen lisääminen epäonnistui.",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { question: string; answer: string } }) => {
      const { error } = await supabase
        .from('faq_items')
        .update({
          question: data.question,
          answer: data.answer,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq-items'] });
      setEditingItem(null);
      toast({
        title: "Kysymys päivitetty",
        description: "FAQ-kysymys on päivitetty onnistuneesti."
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq-items'] });
      setDeleteConfirm(null);
      toast({
        title: "Kysymys poistettu",
        description: "FAQ-kysymys on poistettu onnistuneesti."
      });
    }
  });

  const handleAdd = () => {
    if (!formData.question.trim() || !formData.answer.trim()) return;
    addMutation.mutate(formData);
  };

  const handleUpdate = (id: string, question: string, answer: string) => {
    updateMutation.mutate({ id, data: { question, answer } });
  };

  if (isLoading) {
    return <div className="p-6 text-white">Ladataan FAQ-kysymyksiä...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">FAQ-kysymysten hallinta</h2>
          <p className="text-gray-400">Hallitse usein kysyttyjä kysymyksiä ja vastauksia</p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-blondify-blue hover:bg-blondify-blue/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Lisää kysymys
        </Button>
      </div>

      {/* Add new FAQ form */}
      {isAdding && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Lisää uusi FAQ-kysymys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium">Kysymys</label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Kirjoita kysymys..."
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium">Vastaus</label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                placeholder="Kirjoita vastaus..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Tallenna
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setFormData({ question: '', answer: '', category: 'ukk' });
                }}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Peruuta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {faqItems?.map((item) => (
          <FAQItemCard
            key={item.id}
            item={item}
            isEditing={editingItem === item.id}
            onEdit={(id) => setEditingItem(id)}
            onSave={handleUpdate}
            onCancel={() => setEditingItem(null)}
            onDelete={(id) => setDeleteConfirm(id)}
            isUpdating={updateMutation.isPending}
          />
        ))}
      </div>

      {faqItems?.length === 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-8 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Ei FAQ-kysymyksiä vielä lisätty.</p>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-blondify-blue hover:bg-blondify-blue/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Lisää ensimmäinen kysymys
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Poista kysymys</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Haluatko varmasti poistaa tämän FAQ-kysymyksen? Toimintoa ei voi peruuttaa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Peruuta
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Poista
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface FAQItemCardProps {
  item: FaqItem;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onSave: (id: string, question: string, answer: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const FAQItemCard: React.FC<FAQItemCardProps> = ({
  item,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  isUpdating
}) => {
  const [editData, setEditData] = useState({
    question: item.question,
    answer: item.answer
  });

  const handleSave = () => {
    if (!editData.question.trim() || !editData.answer.trim()) return;
    onSave(item.id, editData.question, editData.answer);
  };

  if (isEditing) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-white text-sm font-medium">Kysymys</label>
            <Input
              value={editData.question}
              onChange={(e) => setEditData({ ...editData, question: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="text-white text-sm font-medium">Vastaus</label>
            <Textarea
              value={editData.answer}
              onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Tallenna
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4 mr-2" />
              Peruuta
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            #{item.display_order}
          </Badge>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item.id)}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-gray-400 hover:text-red-400 hover:bg-gray-800"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="text-white font-semibold text-lg">{item.question}</h3>
          </div>
          <div>
            <p className="text-gray-300 leading-relaxed">{item.answer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFAQManager;
