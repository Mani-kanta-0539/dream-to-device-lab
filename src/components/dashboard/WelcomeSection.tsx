import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export const WelcomeSection = () => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
      <h1 className="text-3xl font-bold mb-2">
        {greeting}, <span className="text-primary">Champion</span>!
      </h1>
      <p className="text-muted-foreground">
        Ready to crush your fitness goals today? Let's make it happen!
      </p>
    </Card>
  );
};
