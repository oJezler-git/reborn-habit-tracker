import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";

/**
 * Navbar: The primary navigation header for the REBORN platform.
 *
 * Implements a "Glassmorphic" sticky header with backdrop blur effects.
 * It manages context-aware navigation, switching between smooth-scroll anchor links
 * (when on the Landing page) and standard route transitions.
 */
export function Navbar() {
  const location = useLocation();

  /**
   * Orchestrates smooth scrolling to specific sections of the Landing page.
   *
   * If already on the home route, it prevents the default anchor jump to
   * maintain a seamless SPA feel. It attempts to use the Lenis engine for
   * synchronised scrolling before falling back to native browser behaviour.
   */
  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string,
  ) => {
    if (location.pathname !== "/") {
      return; // Permits standard Link navigation if transitioning from another page
    }

    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Updates the URL hash without triggering a full page reload or scroll jump
      window.history.pushState({}, "", `#${id}`);

      // Leverages the Lenis instance if globally available for high-performance scrolling
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(`#${id}`);
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Branding & Primary Desktop Navigation */}
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <span className="hidden font-bold sm:inline-block">{APP_NAME}</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {/* 
                Conditional Navigation Logic:
                When on the root index, we use anchor tags with a custom scroll handler 
                to avoid unnecessary route mounting and provide a smoother UX.
            */}
            {location.pathname === "/" ? (
              <>
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer"
                  href="#features"
                  onClick={(e) => handleScrollToSection(e, "features")}
                >
                  Features
                </a>
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer"
                  href="#pricing"
                  onClick={(e) => handleScrollToSection(e, "pricing")}
                >
                  Pricing
                </a>
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer"
                  href="#faq"
                  onClick={(e) => handleScrollToSection(e, "faq")}
                >
                  FAQ
                </a>
              </>
            ) : (
              <>
                <Link
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  to="/#features"
                >
                  Features
                </Link>
                <Link
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  to="/#pricing"
                >
                  Pricing
                </Link>
                <Link
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  to="/#faq"
                >
                  FAQ
                </Link>
              </>
            )}
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              to="/about"
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Secondary Actions: Authentication & Conversion */}
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
            <Button size="sm">Get Started</Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
