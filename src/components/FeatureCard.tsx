import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
}

export const FeatureCard = ({
  number,
  title,
  description,
  href,
  icon: Icon,
  gradient,
}: FeatureCardProps) => {
  return (
    <Link
      to={href}
      className="group relative overflow-hidden rounded-2xl h-64 block transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${gradient} transition-transform duration-500 group-hover:scale-105`} />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      {/* Icon Background */}
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
        <Icon className="h-32 w-32 text-white" />
      </div>
      
      {/* Number Badge */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold backdrop-blur-sm group-hover:bg-white/30 transition-colors">
          {number}
        </span>
      </div>
      
      {/* Text Content */}
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <h3 className="font-display text-xl font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">
          {title}
        </h3>
        <p className="text-sm text-white/80 leading-relaxed mb-3 opacity-90 group-hover:opacity-100 transition-opacity">
          {description}
        </p>
        <div className="flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span>Explore</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};
