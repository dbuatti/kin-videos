"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Login = () => {
  const { user, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  // Clear any hash fragments from the URL that might interfere with the Auth UI
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('error=')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const errorDescription = params.get('error_description');
      if (errorDescription) {
        setAuthError(errorDescription.replace(/\+/g, ' '));
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  // Determine the correct redirect URL. 
  // On mobile/iPad, we must ensure we aren't redirecting to 'localhost' 
  // if the app is being accessed via a network IP or Dyad URL.
  const getRedirectUrl = () => {
    const url = new URL(window.location.origin);
    return url.toString();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        {authError && (
          <Alert variant="destructive" className="rounded-2xl border-red-500/20 bg-red-500/10 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription className="text-xs">
              {authError}
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full rounded-[2.5rem] shadow-2xl border-white/5 bg-slate-900/40 backdrop-blur-xl">
          <CardHeader className="text-center pt-10">
            <div className="bg-primary/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/30">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black text-white tracking-tight">
              FNH Archiver
            </CardTitle>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Sign in to access your course library.
            </p>
          </CardHeader>
          <CardContent className="pb-10">
            <Auth
              supabaseClient={supabase}
              providers={['google']}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(224.3 76.3% 48%)',
                      brandAccent: 'hsl(224.3 76.3% 40%)',
                      inputBackground: 'rgba(255, 255, 255, 0.05)',
                      inputText: 'white',
                      inputBorder: 'rgba(255, 255, 255, 0.1)',
                      inputPlaceholder: 'rgba(255, 255, 255, 0.3)',
                    },
                    radii: {
                      borderRadiusButton: '1rem',
                      inputBorderRadius: '1rem',
                    },
                  },
                },
              }}
              view="sign_in" 
              theme="dark"
              redirectTo={getRedirectUrl()}
            />
            
            <div className="mt-6 text-center">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                Current Origin: {window.location.origin}
              </p>
              {window.location.hostname === 'localhost' && (
                <p className="text-[9px] text-amber-500/60 mt-2 px-4">
                  Note: If you are on an iPad, ensure you are using the Dyad URL or your computer's IP address instead of "localhost".
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;