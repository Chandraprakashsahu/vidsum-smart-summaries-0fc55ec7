import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: { name: string; email: string; avatar: string };
  onSave: (updates: { name: string; email: string; avatar: string }) => Promise<void> | void;
}

const avatarSeeds = ["User", "Felix", "Aneka", "Bailey", "Cleo", "Dusty", "Milo", "Bubbles"];

const EditProfileDialog = ({ open, onOpenChange, profile, onSave }: EditProfileDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [saving, setSaving] = useState(false);

  // Sync state when profile changes
  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setAvatar(profile.avatar);
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), email: email.trim(), avatar });
      toast({ title: "Profile updated!", duration: 2000 });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Avatar Selection */}
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex gap-2 flex-wrap">
              {avatarSeeds.map((seed) => (
                <button
                  key={seed}
                  onClick={() => setAvatar(seed)}
                  className={`rounded-full p-0.5 transition-all ${
                    avatar === seed ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-80"
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} />
                    <AvatarFallback>{seed[0]}</AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
