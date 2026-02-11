import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LayoutProps {
  children: ReactNode;
}

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/herd-projection", label: "HERD PROJECTION" },
  { href: "/event-logging", label: "EVENT LOGGING" },
  { href: "/comparison-report", label: "COMPARISON REPORT" },
  { href: "/about", label: "ABOUT" },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <span className="font-display text-2xl font-bold tracking-wider text-primary">
                FHPS
              </span>
              <div className="hidden sm:block text-xs leading-tight text-muted-foreground">
                <div>FIBONACCI-BASED</div>
                <div>HERD PROJECTION</div>
                <div>SYSTEM</div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="SEARCH"
                  className="w-48 pr-10 bg-muted/50 border-transparent focus:border-primary"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <Link
                to="/"
                className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                  location.pathname === "/"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                HOME
              </Link>
            </div>
          </div>

          {/* Mobile Nav */}
          <nav className="lg:hidden flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {navLinks.slice(1).map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 mt-12">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold">FHPS • Fibonacci-Based Herd Projection System</p>
          <p className="mt-1">For farmers, farm managers, and agricultural students</p>
        </div>
      </footer>
    </div>
  );
};
