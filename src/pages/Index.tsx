"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/integrations/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import NewJobForm from "@/components/NewJobForm";
import JobTable from "@/components/JobTable";

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
      <header className="flex justify-between items-center mb-10 border-b pb-4 border-indigo-100">
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">
          FNH Archiver Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 hidden sm:inline">
            Logged in as: <span className="font-medium text-indigo-600">{user?.email}</span>
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

      <main className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <NewJobForm />
          </div>
          <div className="lg:col-span-2">
            <JobTable />
          </div>
        </div>
      </main>
      
      <div className="mt-12">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;