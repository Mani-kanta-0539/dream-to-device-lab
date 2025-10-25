import { Link } from "react-router-dom";
import { ArrowRight, Video, Dumbbell, Apple, TrendingUp, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const features = [
    {
      icon: Video,
      title: "AI Video Analysis",
      description: "Upload your workout videos and get detailed feedback on form, posture, and technique.",
    },
    {
      icon: Dumbbell,
      title: "Personalized Workouts",
      description: "Custom workout plans tailored to your goals, fitness level, and preferences.",
    },
    {
      icon: Apple,
      title: "Custom Diet Plans",
      description: "Nutrition plans designed for your specific goals and dietary restrictions.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visual dashboards and analytics to track your fitness journey effectively.",
    },
    {
      icon: Award,
      title: "Gamified Experience",
      description: "Earn badges, complete challenges, and stay motivated with achievements.",
    },
    {
      icon: Zap,
      title: "Real-time Feedback",
      description: "Live posture analysis during workouts with instant AI-powered guidance.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fitness Enthusiast",
      content: "AscendFit transformed my home workouts. The AI feedback is like having a personal trainer!",
    },
    {
      name: "Michael Chen",
      role: "Beginner",
      content: "Started my fitness journey with AscendFit. The personalized plans made it so easy to get started.",
    },
    {
      name: "Emma Williams",
      role: "Athlete",
      content: "The video analysis feature helped me perfect my form and prevent injuries. Game changer!",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-20 md:py-32">
        <div className="container mx-auto text-center space-y-8 max-w-4xl animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Transform Your Fitness Journey with{" "}
            <span className="text-primary">AI-Powered</span> Coaching
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized workout plans, real-time form analysis, and custom nutrition guidance—all powered by advanced AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="group">
              <Link to="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to achieve your fitness goals in one platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow animate-fade-in">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">Join thousands achieving their fitness goals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="animate-fade-in">
                <CardContent className="pt-6 space-y-4">
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Join AscendFit today and experience the future of personalized fitness coaching
          </p>
          <Button size="lg" variant="secondary" asChild className="group">
            <Link to="/register">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
