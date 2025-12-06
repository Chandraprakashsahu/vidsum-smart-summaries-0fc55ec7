import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Headphones, Sparkles } from "lucide-react";

const onboardingScreens = [
  {
    icon: Sparkles,
    title: "ज्ञान, अब मिनटों में।",
    description: "लंबे YouTube वीडियो के सार को पढ़ें या सुनें।",
  },
  {
    icon: Clock,
    title: "अपना समय बचाएं",
    description: "घंटों के वीडियो देखने की ज़रूरत नहीं, बस मुख्य बातें जानें।",
  },
  {
    icon: Headphones,
    title: "पढ़ें या सुनें",
    description: "ड्राइविंग करते हुए या काम करते हुए भी ज्ञान प्राप्त करें।",
  },
];

const Onboarding = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigate("/auth");
    }
  };

  const screen = onboardingScreens[currentScreen];
  const Icon = screen.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
        {currentScreen === 0 && (
          <div className="mb-8 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">VidSum</h1>
          </div>
        )}

        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-8 animate-in fade-in zoom-in duration-500">
          <Icon className="h-12 w-12 text-primary" />
        </div>

        <h2 className="text-3xl font-bold text-center mb-4 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
          {screen.title}
        </h2>

        <p className="text-lg text-center text-muted-foreground max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {screen.description}
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center gap-2 mb-6">
          {onboardingScreens.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentScreen ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {currentScreen === onboardingScreens.length - 1
            ? "Get Started"
            : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
