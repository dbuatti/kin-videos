"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap } from 'lucide-react';
import React from 'react';

const Login = () => {
  const { user, isLoading } = useAuth();

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
      <Card className="w-full max-w-md rounded-[2.5rem] shadow-2xl border-white/5 bg-slate-900/40 backdrop-blur-xl">
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
            redirectTo={window.location.origin + '/'}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;