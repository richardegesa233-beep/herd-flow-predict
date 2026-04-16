import { Link } from "react-router-dom";
import { ArrowRight, LucideIcon } from "lucide-react";

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
      className="group relative overflow-hidden rounded-2xl h-[280px] block transition-all duration-500 hover:scale-[1.02] shadow-card hover:shadow-elevated"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${gradient} transition-transform duration-700 group-hover:scale-105`} />
      
      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii44IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIiB0eXBlPSJmcmFjdGFsTm9pc2UiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMSIvPjwvc3ZnPg==')]" />
      
      {/* Content overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      
      {/* Decorative icon */}
      <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:rotate-6 group-hover:-translate-y-1">
        <Icon className="h-24 w-24 text-white" strokeWidth={1} />
      </div>
      
      {/* Number */}
      <div className="absolute top-5 left-5">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/12 text-white/90 text-xs font-bold backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-all duration-300">
          {number}
        </span>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-lg font-bold mb-1.5 group-hover:translate-x-0.5 transition-transform duration-400" style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h3>
        <p className="text-sm text-white/70 leading-relaxed line-clamp-2 mb-3">
          {description}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span>Explore</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
};
