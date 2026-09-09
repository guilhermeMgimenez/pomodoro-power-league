import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Protótipo: apenas redireciona para home
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 neon-glow mb-4">
            <Timer className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold neon-text tracking-tight">Foco</h1>
          <p className="text-muted-foreground text-lg">Entre para continuar sua jornada</p>
        </div>

        {/* Login Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 space-y-6 shadow-2xl hover:border-primary/40 transition-all duration-300">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-neon-blue/20 h-12 transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-neon-blue/20 h-12 transition-all duration-300"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-background font-semibold h-12 text-base neon-glow hover:scale-[1.02] transition-all duration-300"
            >
              Entrar
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="text-center space-y-3">
            <button className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
              Esqueceu a senha?
            </button>
            <div className="text-sm text-muted-foreground">
              Não tem conta?{" "}
              <button className="text-primary hover:text-primary/80 transition-colors font-semibold hover:underline">
                Criar conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
