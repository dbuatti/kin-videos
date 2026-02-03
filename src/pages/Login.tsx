"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import React from 'react';

const AuthComponent = () => (
  <Auth
    supabaseClient={supabase}
    providers={[]}
    appearance={{
      theme: ThemeSupa,
      variables: {
        default: {
          colors: {
            brand: 'hsl(240 5.9% 10%)', // Primary color matching the theme
            brandAccent: 'hsl(224.3 76.3% 48%)', // Accent color
          },
          radii: {
            borderRadiusButton: '0.75rem',
            inputBorderRadius: '0.75rem',
          },
        },
      },
    }}
    // Setting the initial view to sign_in, which allows switching to sign_up
    view="sign_in" 
    theme="light"
    redirectTo={window.location.origin + '/'}
  />
);

const Login = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md rounded-xl shadow-2xl border-4 border-indigo-100">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-indigo-600">
            FNH Archiver Login
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in or sign up to manage your crawling jobs.
          </p>
        </CardHeader>
        <CardContent>
          <React.Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />}>
            <AuthComponent />
          </React.Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;