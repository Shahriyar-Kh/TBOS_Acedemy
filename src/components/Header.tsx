import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/data/navigation";
import { whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-md shadow-soft"
          : "bg-background/60 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 xl:gap-4 container-px py-3">
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Main navigation">
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground data-[status=active]:font-semibold data-[status=active]:text-primary whitespace-nowrap xl:px-3.5 xl:py-2 xl:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex xl:gap-2 shrink-0">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="hidden xl:grid h-10 w-10 place-items-center rounded-lg text-success transition-colors hover:bg-accent"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <Button asChild variant="outline" size="sm" className="px-2.5 text-xs xl:px-3 xl:text-sm">
            <Link to="/free-demo">Free Demo</Link>
          </Button>
          <Button asChild variant="hero" size="sm" className="px-2.5 text-xs xl:px-3 xl:text-sm">
            <Link to="/apply">Apply Now</Link>
          </Button>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg text-foreground hover:bg-accent lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 container-px py-4" aria-label="Mobile navigation">
            {mainNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-lg px-4 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-accent data-[status=active]:font-semibold data-[status=active]:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button asChild variant="hero" size="lg">
                <Link to="/apply">Apply Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/free-demo">Request Free Demo</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 text-success" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
