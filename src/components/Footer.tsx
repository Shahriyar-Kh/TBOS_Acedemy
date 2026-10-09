import { Link } from "@tanstack/react-router";
import {
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Youtube,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { footerLinks } from "@/data/navigation";
import { site, whatsappLink } from "@/data/site";

function Column({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-gradient-hero text-primary-foreground">
      <div className="mx-auto max-w-7xl container-px py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/75">
              {site.description}
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { href: site.social.facebook, icon: Facebook, label: "Facebook" },
                { href: site.social.instagram, icon: Instagram, label: "Instagram" },
                { href: site.social.tiktok, icon: Music2, label: "TikTok" },
                { href: site.social.youtube, icon: Youtube, label: "YouTube" },
                { href: site.social.linkedin, icon: Linkedin, label: "LinkedIn" },
              ]
                .filter(({ href }) => Boolean(href))
                .map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
            </div>
          </div>

          <Column title="Academy" links={footerLinks.academy} />
          <Column title="Learn" links={footerLinks.learn} />

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${site.email}`} className="hover:text-gold">
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold"
                >
                  WhatsApp us
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-gold" />
                <span>{site.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/15 pt-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
            Popular searches
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {footerLinks.popular.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs text-primary-foreground/75 transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/15 pt-6 text-sm text-primary-foreground/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.fullName}. All rights reserved.
          </p>
          <div className="flex gap-5">
            {footerLinks.legal.map((l) => (
              <Link key={l.to} to={l.to} className="transition-colors hover:text-gold">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
