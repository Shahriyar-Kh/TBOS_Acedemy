import {
  Code2,
  Braces,
  Terminal,
  Database,
  Coffee,
  Cpu,
  Sigma,
  Atom,
  Layers,
  Globe,
  MonitorSmartphone,
  Server,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Code2,
  Braces,
  Terminal,
  Database,
  Coffee,
  Cpu,
  Sigma,
  Atom,
  Layers,
  Globe,
  MonitorSmartphone,
  Server,
  GraduationCap,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = icons[name] ?? Code2;
  return <Comp className={className} aria-hidden="true" />;
}
