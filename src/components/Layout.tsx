import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LayoutProps {
  children: ReactNode;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/herd-projection", label: "Projection" },
  { href: "/event-simulation", label: "Simulation" },
  { href: "/comparison-report", label: "Analysis" },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (href !== "/" && !user) {
      e.preventDefault();
      navigate("/auth");
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="h-9 w-9 rounded-xl gradient-hero flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow duration-300">
                <Leaf className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-foreground leading-none">
                  FHPS
                </span>
                <span className="text-[9px] text-muted-foreground tracking-widest uppercase leading-tight hidden sm:block">
                  Herd Projection
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 bg-muted/40 rounded-full px-1 py-0.5 border border-border/40">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(e) => handleNavClick(link.href, e)}
                    className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/40">
                    {user.name}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setShowLogoutDialog(true)} className="h-8 w-8 rounded-full" aria-label="Logout">
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="default" size="sm" className="text-xs font-semibold rounded-full px-5 shadow-sm">
                    Sign In
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="lg:hidden flex flex-col gap-0.5 mt-2.5 pb-2 border-t border-border/40 pt-2.5 animate-fade-in">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(e) => handleNavClick(link.href, e)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your herd projections and saved data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 mt-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg gradient-hero flex items-center justify-center">
                <Leaf className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground/80">FHPS</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">Fibonacci-Based Herd Projection System</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For farmers, farm managers & agricultural students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
