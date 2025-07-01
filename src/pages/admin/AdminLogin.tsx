import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { checkIsAdmin } from '@/integrations/supabase/is_admin';

const loginSchema = z.object({
  email: z.string().email({ message: "Virheellinen sähköpostiosoite" }),
  password: z.string().min(6, { message: "Salasanan tulee olla vähintään 6 merkkiä pitkä" }),
});

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get the intended destination from location state, or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // Check if user is already authenticated and is an admin
    const checkAuthStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          // Use the fixed admin check function
          const adminStatus = await checkIsAdmin();
          
          if (adminStatus) {
            setIsAuthenticated(true);
            setIsAdmin(true);
            // Redirect to dashboard or the page they were trying to access
            setTimeout(() => navigate('/admin/dashboard', { replace: true }), 0);
          } else {
            console.log('User is authenticated but not an admin');
            setIsAuthenticated(true);
            setIsAdmin(false);
            // Sign out non-admin users
            await supabase.auth.signOut();
            toast({
              title: "Pääsy kielletty",
              description: "Sinulla ei ole pääsyä ylläpitopaneeliin.",
              variant: "destructive"
            });
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuthStatus();
  }, [navigate, toast]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        console.error('Login error:', error);
        
        // Provide specific error messages
        if (error.message.includes('credentials')) {
          toast({
            title: "Kirjautuminen epäonnistui",
            description: "Virheellinen sähköpostiosoite tai salasana.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Kirjautuminen epäonnistui",
            description: error.message,
            variant: "destructive"
          });
        }
        
        return;
      }
      
      // Use the fixed admin check function
      const isAdmin = await checkIsAdmin();
      
      if (!isAdmin) {
        toast({
          title: "Pääsy kielletty",
          description: "Sinulla ei ole pääsyä ylläpitopaneeliin.",
          variant: "destructive"
        });
        
        // Sign out non-admin users
        await supabase.auth.signOut();
        return;
      }
      
      // Successfully logged in as admin
      toast({
        title: "Kirjautuminen onnistui",
        description: "Tervetuloa ylläpitopaneeliin."
      });
      
      // Redirect to dashboard or the page they were trying to access
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Error during login:', error);
      toast({
        title: "Kirjautuminen epäonnistui",
        description: "Tapahtui virhe kirjautumisessa. Yritä myöhemmin uudelleen.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-redhat">Blondify Admin</h1>
          <p className="text-gray-400">Kirjaudu sisään hallinnoidaksesi Blondify-sivustoa</p>
        </div>
        
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Kirjaudu sisään</CardTitle>
            <CardDescription className="text-gray-400">
              Syötä ylläpitäjän tunnuksesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sähköposti</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@blondify.fi"
                          className="bg-gray-800 border-gray-700"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salasana</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-gray-800 border-gray-700"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-blondify-blue hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kirjaudutaan...
                    </>
                  ) : (
                    "Kirjaudu sisään"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-400">
              Unohditko salasanasi? Ota yhteyttä järjestelmänvalvojaan.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
