import { Layout } from "@/components/Layout";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ClipboardList, BarChart3, ArrowRight } from "lucide-react";
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
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Data-Backed
                <br />
                <span className="text-primary">Population Insights</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-8">
                Whether you need short-term, high-precision forecasting, timeless
                long-term sustainability models, or bold scenario analysis reports.
              </p>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                  HIGH QUALITY
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                  PREMIUM DESIGN
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                  VERSATILE
                </Badge>
                <Link to="/herd-projection">
                  <Button className="gap-2">
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
          <FeatureCard
            number="01"
            title="Smart Herd Forecasting"
            description="Predict future herd size."
            href="/herd-projection"
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600"
          />
          <FeatureCard
            number="02"
            title="Real-Time Data Capture"
            description="Log critical farm activities."
            href="/event-logging"
            icon={ClipboardList}
            gradient="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500"
          />
          <FeatureCard
            number="03"
            title="Performance Benchmarking"
            description="Compare your current herd's performance metrics."
            href="/comparison-report"
            icon={BarChart3}
            gradient="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-secondary/50 py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold mb-8 text-center">
            How the Fibonacci Model Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Natural Growth Pattern</h3>
              <p className="text-muted-foreground text-sm">
                Like the famous Fibonacci sequence, cattle herds grow in a pattern where 
                adult cows produce calves, and those calves mature to become productive adults.
              </p>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">2-Year Maturation</h3>
              <p className="text-muted-foreground text-sm">
                Calves typically take 2 years to reach breeding age. This delay creates 
                the characteristic wave-like growth similar to Fibonacci numbers.
              </p>
            </div>
            <div className="bg-background rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Realistic Factors</h3>
              <p className="text-muted-foreground text-sm">
                The model accounts for birth rates and mortality, providing a realistic 
                projection that helps farmers and managers plan for the future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-display font-bold mb-8 text-center">
          Who Can Use This System?
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🧑‍🌾</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Farmers</h3>
            <p className="text-muted-foreground text-sm">
              Plan how your herd will grow and make informed decisions about breeding and sales.
            </p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🏛️</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">University Farm Managers</h3>
            <p className="text-muted-foreground text-sm">
              Predict milk and meat production capacity for research and educational purposes.
            </p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Students</h3>
            <p className="text-muted-foreground text-sm">
              Learn herd dynamics with a simple, visual model based on mathematical principles.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
