import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { LoginForm } from "@/components/auth/LoginForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { DayOff, User } from "@/lib/types";
import { Calendar } from "@/components/calendar/Calendar";
import { Dashboard } from "./admin/Dashboard";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;
    if (token) {
      setIsAuthenticated(true);
    }
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
          <div className="text-center space-y-2">
            <CalendarIcon className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold">Exceptional</h1>
            <p className="text-gray-500">
              Connectez-vous pour gérer vos jours de TT exceptionnels
            </p>
          </div>
          {showResetPassword ? (
            <ResetPasswordForm onBack={() => setShowResetPassword(false)} />
          ) : (
            <LoginForm
              onSuccess={handleLogin}
              onResetPassword={() => setShowResetPassword(true)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Exceptional</h1>
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
