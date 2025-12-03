import { ArrowLeft, Moon, Sun, Bell, Globe, Lock, HelpCircle, Info, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const settingsSections = [
    {
      title: "Appearance",
      items: [
        {
          icon: theme === "dark" ? Moon : Sun,
          label: "Dark Mode",
          type: "toggle",
          value: theme === "dark",
          onChange: () => setTheme(theme === "dark" ? "light" : "dark"),
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          type: "toggle",
          value: true,
          onChange: () => {},
        },
      ],
    },
    {
      title: "General",
      items: [
        {
          icon: Globe,
          label: "Language",
          type: "link",
          value: "English",
        },
        {
          icon: Lock,
          label: "Privacy",
          type: "link",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          type: "link",
        },
        {
          icon: Info,
          label: "About",
          type: "link",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center h-16 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground ml-2">Settings</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {section.title}
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-foreground" />
                      </div>
                      <span className="text-foreground font-medium">{item.label}</span>
                    </div>
                    {item.type === "toggle" ? (
                      <Switch
                        checked={item.value as boolean}
                        onCheckedChange={item.onChange}
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {item.value || "→"}
                      </span>
                    )}
                  </div>
                  {itemIndex < section.items.length - 1 && (
                    <Separator className="ml-16" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button className="w-full mt-4 p-4 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl flex items-center justify-center gap-2 transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </main>
    </div>
  );
};

export default Settings;
