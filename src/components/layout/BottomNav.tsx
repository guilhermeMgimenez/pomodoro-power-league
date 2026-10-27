import { Home, Target, Users, User, ListTodo, ChartNoAxesColumn } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/tarefas", icon: ListTodo, label: "Tarefas" },
    { path: "/missoes", icon: Target, label: "Missões" },
    { path: "/resumos", icon: ChartNoAxesColumn, label: "Resumos" },
    { path: "/amigos", icon: Users, label: "Amigos" },
    { path: "/perfil", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-foreground/10 z-50">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-20 px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="group flex flex-col items-center gap-1.5 flex-1 py-2 transition-all duration-200"
            >
              <Icon
                strokeWidth={1.5}
                className={`w-6 h-6 transition-all duration-200 ${
                  isActive
                    ? "text-primary neon-glow"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
