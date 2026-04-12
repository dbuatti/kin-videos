"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, AlertCircle, Smartphone, Monitor } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Login = () => {
  const { user, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLocalhostOnMobile, setIsLocalhostOnMobile] = useState(false);

  useEffect(() => {
    // Check if we are on a mobile device but using localhost
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isMobile && isLocalhost) {
      setIsLocalhostOnMobile(true);
    }

    // Handle errors from URL hash
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        {isLocalhostOnMobile && (
          <Alert className="rounded-2xl border-amber-500/20 bg-amber-500/10 text-amber-400">
            <Smartphone className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-tight">iPad/Mobile Detected</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              You are accessing the app via <code className="text-white">localhost</code>. 
              Google Login <strong>will fail</strong> because it won't know how to get back to your iPad.
              <br /><br />
              <strong>Solution:</strong> Use the URL from your computer's browser (the one ending in <code className="text-white">.dyad.sh</code>) instead of localhost.
            </AlertDescription>
          </Alert>
        )}

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
              redirectTo={window.location.origin}
            />
            
            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Current Connection</p>
              <div className="flex items-center justify-center space-x-2 text-white font-mono text-[10px]">
                {window.location.hostname === 'localhost' ? <Monitor className="w-3 h-3 text-amber-500" /> : <Smartphone className="w-3 h-3 text-emerald-500" />}
                <span>{window.location.origin}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;