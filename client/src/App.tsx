import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import HomePage from "@/pages/home-page";
import BrandingPage from "@/pages/branding-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { UnifiedNavBar } from "@/components/unified-navbar";
import { BrandingProvider } from "@/hooks/use-branding";

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavBar />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/branding" component={BrandingPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandingProvider>
          <AppContent />
          <Toaster />
        </BrandingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;