import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Protótipo: apenas redireciona para home
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold neon-text">Foco</h1>
          <p className="text-muted-foreground">Entre para continuar</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6 neon-glow">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-neon-blue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-neon-blue"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-neon-blue hover:bg-neon-blue/90 text-foreground font-semibold neon-glow"
            >
              Entrar
            </Button>
          </form>

          <div className="text-center space-y-2">
            <button className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors">
              Esqueceu a senha?
            </button>
            <div className="text-sm text-muted-foreground">
              Não tem conta?{" "}
              <button className="text-neon-cyan hover:text-neon-sky transition-colors font-medium">
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
