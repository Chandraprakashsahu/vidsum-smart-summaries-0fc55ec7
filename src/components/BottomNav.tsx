import { Home, Compass, Plus, Heart, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t("nav.home"), path: "/home" },
    { icon: Compass, label: t("nav.explore"), path: "/explore" },
    { icon: Plus, label: t("nav.add"), path: "/add" },
    { icon: Heart, label: t("nav.following"), path: "/following" },
    { icon: User, label: t("nav.profile"), path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20">
      <div className="container flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "fill-primary" : ""}`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
