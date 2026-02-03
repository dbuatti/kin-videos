"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/integrations/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

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
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">
          FNH Archiver Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 hidden sm:inline">
            Logged in as: {user?.email}
          </span>
          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="text-center py-20 border-4 border-dashed border-indigo-200 rounded-3xl bg-white shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Welcome to the Crawler Management Interface
        </h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          This dashboard will be used to configure and monitor your Kajabi content extraction jobs.
        </p>
        <p className="mt-8 text-sm text-gray-400">
          (Next step: Building the UI for job configuration and status tracking.)
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;