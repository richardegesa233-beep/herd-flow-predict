import { Layout } from "@/components/Layout";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { TrendingUp, ClipboardList, BarChart3, ArrowRight, Leaf, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroCattle from "@/assets/hero-cattle.jpg";

const Home = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[520px] lg:min-h-[580px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 lg:w-[55%]">
          <img
            src={heroCattle}
            alt="Cattle grazing on pasture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-background lg:block hidden" />
          <div className="absolute inset-0 bg-background/65 lg:hidden" />
        </div>

        {/* Content */}
        <div className="relative container max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center min-h-[520px] lg:min-h-[580px]">
            <div className="lg:ml-auto lg:w-[48%] py-14 lg:pl-10">
              <div className="animate-slide-up">
                <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full border border-primary/15 mb-5">
                  <Leaf className="h-3 w-3" />
                  Fibonacci-Based Growth Model
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-foreground leading-[1.1] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Data-Backed
                  <br />
                  <span className="text-primary">Herd Insights</span>
                </h1>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed animate-slide-up stagger-1">
                High-precision forecasting, long-term sustainability models, and actionable variance analysis — all in one system.
              </p>

              <div className="flex flex-wrap items-center gap-3 animate-slide-up stagger-2">
                <Link to="/herd-projection">
                  <Button variant="hero" size="lg" className="gap-2 rounded-xl shadow-lg">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="gap-2 rounded-xl">
                    Learn More
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="container max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Core Features</p>
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Everything You Need
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="animate-slide-up stagger-1">
            <FeatureCard
              number="01"
              title="Smart Herd Forecasting"
              description="Predict future herd size with Fibonacci-based growth projections."
              href="/herd-projection"
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500"
            />
          </div>
          <div className="animate-slide-up stagger-2">
            <FeatureCard
              number="02"
              title="Stochastic Event Simulation"
              description="Simulate births, deaths, and sales with probabilistic models and environmental shocks."
              href="/event-simulation"
              icon={ClipboardList}
              gradient="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-500"
            />
          </div>
          <div className="animate-slide-up stagger-3">
            <FeatureCard
              number="03"
              title="Performance Benchmarking"
              description="Compare projected vs actual with MAE, MAPE, RMSE metrics."
              href="/comparison-report"
              icon={BarChart3}
              gradient="bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 gradient-surface">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Methodology</p>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              How the Fibonacci Model Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
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
                desc: "The model accounts for birth rates, mortality, and culling — providing realistic projections that help farmers plan for the future.",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className={`bg-card rounded-2xl p-7 shadow-card hover-lift border border-border/50 animate-slide-up stagger-${index + 1}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <span className="text-lg font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>{item.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Built For</p>
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Who Can Use This System?
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              emoji: "🧑‍🌾",
              title: "Farmers",
              desc: "Plan how your herd will grow and make informed decisions about breeding and sales.",
            },
            {
              emoji: "🏛️",
              title: "Farm Managers",
              desc: "Predict milk and meat production capacity for research and institutional planning.",
            },
            {
              emoji: "📚",
              title: "Students",
              desc: "Learn herd dynamics with a simple, visual model based on mathematical principles.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className={`bg-card border border-border/50 rounded-2xl p-7 text-center shadow-card hover-lift animate-scale-in stagger-${index + 1}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 mx-auto mb-5 flex items-center justify-center animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                <span className="text-2xl">{item.emoji}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Home;
