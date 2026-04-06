"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/integrations/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Info, ShieldCheck, Zap, BookOpen, Bug, Library } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import NewJobForm from "@/components/NewJobForm";
import JobTable from "@/components/JobTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Failed to log out: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="flex justify-between items-center mb-8 border-b pb-4 border-indigo-100">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Zap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
            FNH Archiver
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button asChild variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
            <Link to="/library">
              <Library className="w-4 h-4 mr-2" />
              Library
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 hidden sm:flex">
            <Link to="/instructions">
              <BookOpen className="w-4 h-4 mr-2" />
              Manual
            </Link>
          </Button>
          <span className="text-sm text-gray-600 hidden md:inline">
            <ShieldCheck className="w-4 h-4 inline mr-1 text-green-500" />
            {user?.email}
          </span>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            size="sm"
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <Alert className="bg-indigo-50 border-indigo-200 rounded-2xl">
          <Info className="h-5 w-5 text-indigo-600" />
          <AlertTitle className="text-indigo-900 font-bold">How it works</AlertTitle>
          <AlertDescription className="text-indigo-700">
            Our <strong>Two-Pass System</strong> first discovers the course structure (Pass 1) and then extracts high-quality video links in the background (Pass 2). 
            <Link to="/instructions" className="ml-2 underline font-semibold hover:text-indigo-900">Read the full manual →</Link>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <NewJobForm />
          </div>
          <div className="lg:col-span-2">
            <JobTable />
          </div>
        </div>
      </main>
      
      <footer className="mt-12 flex flex-col items-center space-y-4">
        <MadeWithDyad />
        <Link to="/debug" className="text-[10px] text-gray-400 hover:text-indigo-400 flex items-center transition-colors">
          <Bug className="w-3 h-3 mr-1" />
          System Debugger
        </Link>
      </footer>
    </div>
  );
};

export default Index;