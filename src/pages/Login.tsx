"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, AlertCircle, Smartphone, Monitor, ExternalLink, ShieldAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Login = () => {
  const { user, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isNonStandardHost, setIsNonStandardHost] = useState(false);

  useEffect(() => {
    // Check if we are on a local IP or localhost
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || 
                   hostname === '127.0.0.1' || 
                   /^192\.168\./.test(hostname) || 
                   /^10\./.test(hostname);
    
    if (isLocal) {
      setIsNonStandardHost(true);
    }

    // Handle errors from URL hash or query params
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const error = searchParams.get('error') || hashParams.get('error');
    const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
    
    if (error || errorDescription) {
      setAuthError(errorDescription?.replace(/\+/g, ' ') || error || "An unexpected authentication error occurred.");
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

  const isExchangeError = authError?.toLowerCase().includes('exchange external code');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        {isNonStandardHost && !authError && (
          <Alert className="rounded-2xl border-amber-500/20 bg-amber-500/10 text-amber-400">
            <Smartphone className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-tight text-xs">Local/IP Access Detected</AlertTitle>
            <AlertDescription className="text-[10px] leading-relaxed">
              You are accessing via <code className="text-white">{window.location.hostname}</code>. 
              Google OAuth requires this exact URL to be added to your <strong>Supabase Redirect URLs</strong> and <strong>Google Cloud Console</strong>.
            </AlertDescription>
          </Alert>
        )}

        {authError && (
          <div className="space-y-3">
            <Alert variant="destructive" className="rounded-2xl border-red-500/20 bg-red-500/10 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Login Failed</AlertTitle>
              <AlertDescription className="text-xs">
                {authError}
              </AlertDescription>
            </Alert>

            {isExchangeError && (
              <Card className="border-amber-500/20 bg-amber-500/5 rounded-2xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center text-amber-400 text-[10px] font-black uppercase tracking-widest">
                    <ShieldAlert className="w-3 h-3 mr-2" />
                    Troubleshooting "4/0A" Error
                  </div>
                  <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4">
                    <li>Ensure <strong>Client Secret</strong> in Supabase Dashboard is correct.</li>
                    <li>Check if your Google App is in "Testing" mode (add your email as a test user).</li>
                    <li>Verify that <code className="text-white">{window.location.origin}</code> is in your Supabase "Additional Redirect URLs".</li>
                  </ul>
                  <a 
                    href="https://supabase.com/docs/guides/auth/social-login/auth-google" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-[9px] font-bold text-primary hover:underline"
                  >
                    View Supabase Google Auth Guide <ExternalLink className="w-2 h-2 ml-1" />
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
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
                <span className="truncate max-w-[200px]">{window.location.origin}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;