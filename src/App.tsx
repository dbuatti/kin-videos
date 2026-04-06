import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "./integrations/supabase/auth-context";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Instructions from "./pages/Instructions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/instructions" element={<Instructions />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;