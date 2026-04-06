"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth-context';
import { usePlaybackSpeed } from '@/hooks/use-playback-speed';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  User, 
  Gauge, 
  Shield, 
  Save,
  LogOut,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { cn } from '@/lib/utils';

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { speed, setSpeed } = usePlaybackSpeed();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      showSuccess("Profile updated successfully!");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-6 sm:mb-8 border-b pb-4 border-white/5">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-white/5 text-slate-400 h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter flex items-center">
            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary" />
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Playback Preferences */}
        <Card className="border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-4 sm:pb-6">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center text-primary">
              <Gauge className="w-5 h-5 mr-2" />
              Playback
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-400">
              Set your default video and audio speed.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 sm:pt-8">
            <div className="space-y-4 sm:space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Default Speed</Label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {SPEEDS.map((s) => (
                  <Button
                    key={s}
                    variant={speed === s ? "default" : "outline"}
                    onClick={() => setSpeed(s)}
                    className={cn(
                      "rounded-xl h-10 sm:h-12 px-4 sm:px-6 font-bold transition-all text-xs sm:text-sm",
                      speed === s 
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                        : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    {s}x
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-4 sm:pb-6">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center text-accent">
              <User className="w-5 h-5 mr-2" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 sm:pt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">First Name</Label>
                <Input 
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white/5 border-white/5 rounded-xl h-11 sm:h-12 focus-visible:ring-accent text-sm"
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Last Name</Label>
                <Input 
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white/5 border-white/5 rounded-xl h-11 sm:h-12 focus-visible:ring-accent text-sm"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <Button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full sm:w-auto bg-accent hover:bg-accent/80 text-white rounded-xl h-11 sm:h-12 px-8 font-bold shadow-lg shadow-accent/20 text-sm"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-4 sm:pb-6">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center text-emerald-400">
              <Shield className="w-5 h-5 mr-2" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 sm:pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-500/20 p-2 rounded-lg shrink-0">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email</p>
                  <p className="text-xs sm:text-sm font-bold text-white truncate">{user?.email}</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 py-1 w-fit text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
              </Badge>
            </div>

            <div className="pt-2">
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full sm:w-auto text-red-400 hover:bg-red-400/10 rounded-xl h-11 sm:h-12 px-6 font-bold text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

      </main>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Settings;