import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/assistant/ChatMessage";
import { QuickActions } from "@/components/assistant/QuickActions";
import { Send, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI fitness assistant. I'm here to help with workout advice, nutrition tips, form corrections, and motivation. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(text),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getAIResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("push-up") || lowerPrompt.includes("pushup")) {
      return "For better push-up form:\n\n1. Keep your body in a straight line from head to heels\n2. Hands should be slightly wider than shoulder-width\n3. Lower until your chest nearly touches the floor\n4. Keep your core engaged throughout\n5. Breathe in on the way down, out on the way up\n\nStart with 3 sets of 10 reps and gradually increase as you get stronger!";
    }
    
    if (lowerPrompt.includes("eat") || lowerPrompt.includes("nutrition")) {
      return "Pre-workout nutrition tips:\n\n1. Eat 1-2 hours before exercise\n2. Include complex carbs (oats, whole grain bread)\n3. Add lean protein (eggs, Greek yogurt)\n4. Stay hydrated with water\n5. Avoid heavy, fatty foods\n\nGood options: Banana with peanut butter, oatmeal with berries, or Greek yogurt with granola.";
    }
    
    if (lowerPrompt.includes("squat")) {
      return "Squat technique tips:\n\n1. Feet shoulder-width apart, toes slightly out\n2. Keep chest up and core engaged\n3. Break at hips and knees simultaneously\n4. Lower until thighs are parallel to ground\n5. Push through heels to return\n6. Keep knees aligned with toes\n\nPractice with bodyweight first before adding resistance!";
    }
    
    if (lowerPrompt.includes("progress")) {
      return "Based on your recent activity, you're making great progress! Here's a summary:\n\n✓ Completed 18 workouts this month\n✓ Lost 2kg towards your goal\n✓ Improved workout consistency\n✓ Earned 3 new achievement badges\n\nKeep up the excellent work! Consider increasing workout intensity or duration for continued progress.";
    }

    return "That's a great question! I'm here to help with:\n\n• Exercise form and technique\n• Workout planning and scheduling\n• Nutrition and meal planning\n• Progress tracking and goals\n• Motivation and consistency tips\n\nFeel free to ask me anything specific about your fitness journey!";
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">AI Fitness Assistant</h1>
            <p className="text-muted-foreground">
              Your personal AI coach for workouts, nutrition, and motivation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything about fitness..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div>
              <QuickActions onActionClick={handleQuickAction} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
