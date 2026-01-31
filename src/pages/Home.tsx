import { Layout } from "@/components/Layout";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ClipboardList, BarChart3, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroCattle from "@/assets/hero-cattle.jpg";

const Home = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[500px] lg:min-h-[600px] overflow-hidden">
        {/* Background Image - Left Side */}
        <div className="absolute inset-0 lg:w-[55%]">
          <img
            src={heroCattle}
            alt="Cattle grazing on pasture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background lg:block hidden" />
          <div className="absolute inset-0 bg-background/60 lg:hidden" />
        </div>

        {/* Content - Right Side */}
        <div className="relative container max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center min-h-[500px] lg:min-h-[600px]">
            <div className="lg:ml-auto lg:w-1/2 py-12 lg:pl-12">
              <div className="animate-slide-up">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                  Data-Backed
                  <br />
                  <span className="text-primary">Population Insights</span>
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-xl mb-8 animate-slide-up stagger-1">
                Whether you need short-term, high-precision forecasting, timeless
                long-term sustainability models, or bold scenario analysis reports.
              </p>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-3 mb-8 animate-slide-up stagger-2">
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium hover-lift cursor-default">
                  <Sparkles className="h-3 w-3 mr-1" />
                  HIGH QUALITY
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium hover-lift cursor-default">
                  PREMIUM DESIGN
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium hover-lift cursor-default">
                  VERSATILE
                </Badge>
                <Link to="/herd-projection">
                  <Button className="gap-2 hover-lift">
                    LEARN MORE
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="animate-slide-up stagger-1">
            <FeatureCard
              number="01"
              title="Smart Herd Forecasting"
              description="Predict future herd size."
              href="/herd-projection"
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600"
            />
          </div>
          <div className="animate-slide-up stagger-2">
            <FeatureCard
              number="02"
              title="Real-Time Data Capture"
              description="Log critical farm activities."
              href="/event-logging"
              icon={ClipboardList}
              gradient="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500"
            />
          </div>
          <div className="animate-slide-up stagger-3">
            <FeatureCard
              number="03"
              title="Performance Benchmarking"
              description="Compare your current herd's performance metrics."
              href="/comparison-report"
              icon={BarChart3}
              gradient="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-secondary/50 py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold mb-8 text-center animate-fade-in">
            How the Fibonacci Model Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Natural Growth Pattern",
                desc: "Like the famous Fibonacci sequence, cattle herds grow in a pattern where adult cows produce calves, and those calves mature to become productive adults.",
              },
              {
                step: "2",
                title: "2-Year Maturation",
                desc: "Calves typically take 2 years to reach breeding age. This delay creates the characteristic wave-like growth similar to Fibonacci numbers.",
              },
              {
                step: "3",
                title: "Realistic Factors",
                desc: "The model accounts for birth rates and mortality, providing a realistic projection that helps farmers and managers plan for the future.",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className={`bg-background rounded-xl p-6 shadow-sm hover-lift animate-slide-up stagger-${index + 1}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-display font-bold mb-8 text-center animate-fade-in">
          Who Can Use This System?
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            {
              emoji: "🧑‍🌾",
              title: "Farmers",
              desc: "Plan how your herd will grow and make informed decisions about breeding and sales.",
            },
            {
              emoji: "🏛️",
              title: "University Farm Managers",
              desc: "Predict milk and meat production capacity for research and educational purposes.",
            },
            {
              emoji: "📚",
              title: "Students",
              desc: "Learn herd dynamics with a simple, visual model based on mathematical principles.",
            },
          ].map((item, index) => (
            <div key={item.title} className={`p-6 animate-scale-in stagger-${index + 1}`}>
              <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                <span className="text-2xl">{item.emoji}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Home;
