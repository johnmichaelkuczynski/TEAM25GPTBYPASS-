import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { LogOut, User, FolderOpen, Coins } from "lucide-react";
import { Link } from "wouter";
import UserDashboard from "./UserDashboard";

interface HeaderProps {
  provider: string;
  onProviderChange: (provider: string) => void;
  onShowApiKeys?: () => void;
}

export default function Header({ provider, onProviderChange, onShowApiKeys }: HeaderProps) {
  const { user, loginMutation, registerMutation, logoutMutation } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginMutation.mutateAsync(loginData);
    setAuthOpen(false);
    setLoginData({ username: "", password: "" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerMutation.mutateAsync(registerData);
    setAuthOpen(false);
    setRegisterData({ username: "", password: "" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">GPT Bypass</h1>
            <span className="text-sm text-gray-500 font-medium">AI Text Rewriter</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">LLM Provider:</label>
              <Select value={provider} onValueChange={onProviderChange}>
                <SelectTrigger className="w-40" data-testid="select-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">Zhi 1</SelectItem>
                  <SelectItem value="anthropic">Zhi 2</SelectItem>
                  <SelectItem value="deepseek">Zhi 3</SelectItem>
                  <SelectItem value="perplexity">Zhi 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShowApiKeys}
              data-testid="button-api-keys"
            >
              <i className="fas fa-key mr-2"></i>API Keys
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/pricing">
                  <div className="flex items-center bg-blue-50 border border-blue-200 rounded-md px-3 py-1 cursor-pointer hover:bg-blue-100 transition-colors" data-testid="credit-display">
                    <Coins className="h-4 w-4 mr-1 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700" data-testid="text-credits">
                      {user.credits?.toLocaleString() || 0}
                    </span>
                    <span className="text-xs text-blue-500 ml-1">credits</span>
                  </div>
                </Link>
                <span className="text-sm text-gray-700" data-testid="text-username">
                  <User className="inline h-4 w-4 mr-1" />
                  {user.username}
                </span>
                <Dialog open={dashboardOpen} onOpenChange={setDashboardOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-dashboard">
                      <FolderOpen className="h-4 w-4 mr-1" />
                      My Materials
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>My Saved Materials</DialogTitle>
                      <DialogDescription>
                        View your saved documents and rewrite jobs
                      </DialogDescription>
                    </DialogHeader>
                    <UserDashboard />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Dialog open={authOpen} onOpenChange={setAuthOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" data-testid="button-login">
                    <User className="h-4 w-4 mr-1" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Account</DialogTitle>
                    <DialogDescription>
                      Login or create an account to save your work
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-username">Username</Label>
                          <Input
                            id="login-username"
                            data-testid="input-login-username"
                            value={loginData.username}
                            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <Input
                            id="login-password"
                            data-testid="input-login-password"
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending}
                          data-testid="button-submit-login"
                        >
                          {loginMutation.isPending ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="register">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-username">Username</Label>
                          <Input
                            id="register-username"
                            data-testid="input-register-username"
                            value={registerData.username}
                            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password">Password</Label>
                          <Input
                            id="register-password"
                            data-testid="input-register-password"
                            type="password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                          data-testid="button-submit-register"
                        >
                          {registerMutation.isPending ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
