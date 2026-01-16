import { Link } from "react-router-dom";
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
      className="group relative overflow-hidden rounded-2xl h-64 block transition-transform duration-300 hover:scale-[1.02]"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${gradient}`} />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      {/* Icon Background */}
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
        <Icon className="h-32 w-32 text-white" />
      </div>
      
      {/* Number Badge */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold backdrop-blur-sm">
          {number}
        </span>
      </div>
      
      {/* Text Content */}
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <h3 className="font-display text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform">
          {title}
        </h3>
        <p className="text-sm text-white/80 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
};
