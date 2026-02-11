import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Layers, Users, GraduationCap, BarChart3, Activity } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-10 text-center animate-slide-up">
          <Badge variant="outline" className="mb-4 px-4 py-1">
            <GraduationCap className="h-3 w-3 mr-1" />
            University of Embu — BSc Computer Science
          </Badge>
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">
            About This Project
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Implementation and Design of the User Interface for a Fibonacci-Based Herd Projection System
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            By Mugeni Richard Egesa • Reg. No. B135/23238/2022
          </p>
        </div>

        <div className="space-y-8">
          {/* Abstract */}
          <Card className="animate-slide-up stagger-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Abstract
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed space-y-3">
              <p>
                Effective agricultural decision-making requires both accurate predictive models and an intuitive interface to access them. This project focuses on the design and implementation of the Presentation Layer (Frontend) for a Fibonacci-based Herd Projection System.
              </p>
              <p>
                The aim is to develop a professional, user-centric web interface that integrates complex herd forecasting, real-time event tracking, and model validation modules into a single, cohesive dashboard. The methodology involves building a responsive, card-based interface using React and TypeScript, focusing on visual best practices and effective data visualization.
              </p>
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card className="animate-slide-up stagger-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Project Objectives
              </CardTitle>
              <CardDescription>General and specific objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="font-semibold text-sm mb-1">General Objective</p>
                <p className="text-muted-foreground text-sm">
                  To design and implement a professional, centralized, and highly aesthetic User Interface (UI) for the Fibonacci-based Cattle Herd Projection System to maximize usability and effective data visualization.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  "Design a card-based, responsive web interface with tab navigation for clean aesthetic and intuitive flow across all views.",
                  "Develop the Projection Dashboard UI that collects required mathematical parameters and visualizes time-series data using dynamic charts.",
                  "Construct the Event Logging Interface with structured forms for Births, Sales, and Deaths, plus live herd tracking.",
                  "Implement the Model Validation Report UI with accuracy metrics (MAE/MAPE) and dual charts for Projected vs. Actual counts.",
                ].map((obj, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <Badge variant="secondary" className="shrink-0 mt-0.5">{i + 1}</Badge>
                    <p className="text-sm text-muted-foreground">{obj}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Problem Statement */}
          <Card className="animate-slide-up stagger-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Information Overload",
                    desc: "Collecting diverse user inputs and displaying large output tables/charts in an organized, non-confusing manner.",
                    icon: BarChart3,
                  },
                  {
                    title: "Logic ↔ Perception Gap",
                    desc: "Transforming complex Fibonacci model output and validation metrics into clear, actionable visual feedback.",
                    icon: Activity,
                  },
                  {
                    title: "Seamless Integration",
                    desc: "Unifying Projection, Event Logging, and Validation features under a single aesthetic framework.",
                    icon: Layers,
                  },
                ].map((item) => (
                  <div key={item.title} className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <item.icon className="h-5 w-5 text-primary" />
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target Users */}
          <Card className="animate-slide-up stagger-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Target Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 text-center">
                {[
                  { emoji: "🧑‍🌾", title: "Farmers & Ranchers", desc: "Plan herd growth, breeding, and sales decisions." },
                  { emoji: "📊", title: "Agricultural Consultants", desc: "Use predictive analytics for client advisory." },
                  { emoji: "🎓", title: "Students & Researchers", desc: "Learn herd dynamics using mathematical models." },
                ].map((u) => (
                  <div key={u.title} className="p-4">
                    <span className="text-3xl">{u.emoji}</span>
                    <p className="font-semibold text-sm mt-2">{u.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{u.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="animate-slide-up stagger-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Technology Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["React 18", "TypeScript", "Vite", "Tailwind CSS", "Recharts", "shadcn/ui", "jsPDF", "html2canvas"].map((tech) => (
                  <Badge key={tech} variant="outline" className="px-3 py-1.5">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default About;
