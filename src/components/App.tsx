import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Loader2, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { LoginForm } from "@/components/auth/LoginForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
import { Calendar } from "@/components/calendar/Calendar";
import { Dashboard } from "./admin/Dashboard";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  useEffect(() => {
    if (api.token) {
      setIsAuthenticated(true);
      setUser(api.user);
    }
    setIsAuthLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setIsAuthenticated(true);
    setUser(user);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div>
            <div className="space-y-2 flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-2xl font-bold">✨ Exceptional</h1>
                <p className="text-gray-500 text-left">
                  Connectez-vous pour gérer vos jours de TT exceptionnels
                </p>
              </div>
              {!isAuthLoading && (
                <>
                  {showResetPassword ? (
                    <ResetPasswordForm
                      onBack={() => setShowResetPassword(false)}
                    />
                  ) : (
                    <LoginForm
                      onSuccess={handleLogin}
                      onResetPassword={() => setShowResetPassword(true)}
                    />
                  )}
                </>
              )}
              {isAuthLoading && (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">✨ Exceptional</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>

        {user?.superUser && <Dashboard />}
        {!user?.superUser && <Calendar user={user} />}
      </div>
    </div>
  );
}
