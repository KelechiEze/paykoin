// App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Wallets from "./pages/Wallets";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PageWithPreloader from "./pages/PageWithPreloader";

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/signup" replace />} />
                  <Route
                    path="/signup"
                    element={
                      <PageWithPreloader>
                        <Signup />
                      </PageWithPreloader>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PageWithPreloader>
                        <Login />
                      </PageWithPreloader>
                    }
                  />
                  <Route element={<ProtectedRoute />}>
                    <Route
                      path="/dashboard"
                      element={
                        <AppLayout>
                          <PageWithPreloader>
                            <Dashboard />
                          </PageWithPreloader>
                        </AppLayout>
                      }
                    />
                    <Route
                      path="/wallets"
                      element={
                        <AppLayout>
                          <Wallets />
                        </AppLayout>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <AppLayout>
                          <Profile />
                        </AppLayout>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <AppLayout>
                          <Settings />
                        </AppLayout>
                      }
                    />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
