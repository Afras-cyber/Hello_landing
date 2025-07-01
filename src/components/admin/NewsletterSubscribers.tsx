import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Download, Trash2, Users, Mail, Calendar, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';

interface NewsletterSubscriber {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscription_date: string;
  subscription_source: string;
  is_active: boolean;
  brevo_contact_id: string | null;
  brevo_list_id: number | null;
  created_at: string;
  updated_at: string;
  unsubscribed_at: string | null;
}

const NewsletterSubscribers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async (): Promise<NewsletterSubscriber[]> => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('subscription_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const deleteSubscriber = useMutation({
    mutationFn: async (subscriberId: string) => {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', subscriberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      toast.success('Tilaaja poistettu onnistuneesti');
    },
    onError: () => {
      toast.error('Virhe poistettaessa tilaajaa');
    }
  });

  const exportSubscribers = () => {
    const csvContent = [
      ['Sähköposti', 'Tilausaika', 'Tila', 'Lähde', 'Brevo ID'],
      ...filteredSubscribers.map(sub => [
        sub.email,
        format(new Date(sub.subscription_date), 'dd.MM.yyyy HH:mm', { locale: fi }),
        sub.is_active ? 'Aktiivinen' : 'Ei aktiivinen',
        sub.subscription_source,
        sub.brevo_contact_id || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `uutiskirje-tilaajat-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSubscribers = subscribers.filter(sub => sub.is_active).length;
  const totalSubscribers = subscribers.length;
  const newThisMonth = subscribers.filter(sub => {
    const subDate = new Date(sub.subscription_date);
    const now = new Date();
    return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
  }).length;

  const syncedSubscribers = subscribers.filter(sub => sub.brevo_contact_id).length;

  if (isLoading) {
    return <div className="flex justify-center p-8 text-white">Ladataan...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blondify-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Yhteensä</p>
                <p className="text-2xl font-bold text-white">{totalSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Aktiivisia</p>
                <p className="text-2xl font-bold text-white">{activeSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Tässä kuussa</p>
                <p className="text-2xl font-bold text-white">{newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Synkronoitu</p>
                <p className="text-2xl font-bold text-white">{syncedSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Uutiskirjetilaajat ({filteredSubscribers.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={exportSubscribers}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                Vie CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Hae tilaajia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="rounded-md border border-gray-600">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Sähköposti</TableHead>
                  <TableHead className="text-gray-300">Tilausaika</TableHead>
                  <TableHead className="text-gray-300">Tila</TableHead>
                  <TableHead className="text-gray-300">Lähde</TableHead>
                  <TableHead className="text-gray-300">Brevo ID</TableHead>
                  <TableHead className="text-right text-gray-300">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id} className="border-gray-600">
                    <TableCell className="font-medium text-white">{subscriber.email}</TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(subscriber.subscription_date), 'dd.MM.yyyy HH:mm', { locale: fi })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.is_active ? 'default' : 'secondary'} className={subscriber.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                        {subscriber.is_active ? 'Aktiivinen' : 'Ei aktiivinen'}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-gray-300">{subscriber.subscription_source}</TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {subscriber.brevo_contact_id || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => deleteSubscriber.mutate(subscriber.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        disabled={deleteSubscriber.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSubscribers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      {searchTerm ? 'Ei hakutuloksia' : 'Ei tilaajia'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterSubscribers;
