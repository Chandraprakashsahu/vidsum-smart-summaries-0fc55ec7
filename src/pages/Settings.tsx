import { useState, useEffect } from "react";
import { ArrowLeft, Moon, Sun, Bell, Globe, Lock, HelpCircle, Info, LogOut, Check, ChevronRight, Mail, Shield, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const languages = [
  { code: "en" as Language, name: "English" },
  { code: "hi" as Language, name: "हिंदी (Hindi)" },
];

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const [pushNotifications, setPushNotifications] = useState(() => {
    const saved = localStorage.getItem("pushNotifications");
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [languageSheet, setLanguageSheet] = useState(false);
  const [privacySheet, setPrivacySheet] = useState(false);
  const [helpSheet, setHelpSheet] = useState(false);
  const [aboutDialog, setAboutDialog] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);

  useEffect(() => {
    localStorage.setItem("pushNotifications", JSON.stringify(pushNotifications));
  }, [pushNotifications]);

  const handlePushNotifications = (value: boolean) => {
    setPushNotifications(value);
    toast({
      title: value ? "Notifications Enabled" : "Notifications Disabled",
      description: value ? "You'll receive push notifications" : "Push notifications turned off",
    });
  };

  const handleLanguageChange = (code: Language) => {
    setLanguage(code);
    setLanguageSheet(false);
    toast({
      title: t("settings.languageChanged"),
      description: `Language set to ${languages.find(l => l.code === code)?.name}`,
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    setLogoutDialog(false);
    navigate("/");
  };

  const currentLanguage = languages.find(l => l.code === language)?.name || "English";

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
        {/* Appearance */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Appearance
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  {theme === "dark" ? <Moon className="h-5 w-5 text-foreground" /> : <Sun className="h-5 w-5 text-foreground" />}
                </div>
                <span className="text-foreground font-medium">Dark Mode</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Notifications
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Bell className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-foreground font-medium">Push Notifications</span>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={handlePushNotifications}
              />
            </div>
          </div>
        </div>

        {/* General */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            General
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button 
              onClick={() => setLanguageSheet(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Globe className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-foreground font-medium">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">{currentLanguage}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
            <Separator className="ml-16" />
            <button 
              onClick={() => setPrivacySheet(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Lock className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-foreground font-medium">Privacy</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Support
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button 
              onClick={() => setHelpSheet(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-foreground font-medium">Help Center</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <Separator className="ml-16" />
            <button 
              onClick={() => setAboutDialog(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Info className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-foreground font-medium">About</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => setLogoutDialog(true)}
          className="w-full mt-4 p-4 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </main>

      {/* Language Sheet */}
      <Sheet open={languageSheet} onOpenChange={setLanguageSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Select Language</SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-foreground">{lang.name}</span>
                {language === lang.code && <Check className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Privacy Sheet */}
      <Sheet open={privacySheet} onOpenChange={setPrivacySheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Privacy Settings</SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Profile Visibility</p>
                <p className="text-xs text-muted-foreground">Your profile is visible to everyone</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Data Protection</p>
                <p className="text-xs text-muted-foreground">Your data is encrypted and secure</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Help Center Sheet */}
      <Sheet open={helpSheet} onOpenChange={setHelpSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Help Center</SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">FAQ</p>
              <p className="text-xs text-muted-foreground">Find answers to common questions</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">Contact Support</p>
              <p className="text-xs text-muted-foreground">Get help from our team</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Email Us</p>
                <p className="text-xs text-muted-foreground">support@vidsum.app</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* About Dialog */}
      <Dialog open={aboutDialog} onOpenChange={setAboutDialog}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl">VidSum</DialogTitle>
            <DialogDescription className="text-center">
              Version 1.0.0
            </DialogDescription>
          </DialogHeader>
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>YouTube video summarization app</p>
            <p>Read or listen to summaries instead of watching full videos</p>
            <p className="pt-2 text-xs">© 2024 VidSum. All rights reserved.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Log Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? Your saved data will be cleared.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setLogoutDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="flex-1">
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
