import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import type { CourseCatalogVisual } from "@/data/catalogVisuals";
import { cn } from "@/lib/utils";

export function CourseVisualMotifRenderer({
  motif,
  accentColor,
}: {
  motif: CourseCatalogVisual["motif"];
  accentColor: string;
}): ReactNode {
  switch (motif) {
    // 1. html5 - semantic angle-bracket & DOM tree
    case "angle-brackets":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-orange-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M20 25L8 40L20 55"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M80 25L92 40L80 55"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="58" y1="20" x2="42" y2="60" strokeWidth="1.8" strokeLinecap="round" />
          <rect
            x="28"
            y="14"
            width="44"
            height="12"
            rx="3"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          <line x1="34" y1="20" x2="66" y2="20" strokeWidth="1.2" />
        </svg>
      );

    // 2. css3 - style tokens & layout box model
    case "style-tokens":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-sky-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="10" y="12" width="80" height="56" rx="4" strokeWidth="1.4" />
          <rect
            x="22"
            y="22"
            width="56"
            height="36"
            rx="2"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          <rect
            x="36"
            y="32"
            width="28"
            height="16"
            rx="1"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <circle cx="16" cy="18" r="2" fill="currentColor" />
          <circle cx="84" cy="18" r="2" fill="currentColor" />
        </svg>
      );

    // 3. bootstrap-5 - responsive component grid
    case "responsive-grid":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-purple-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="8" y="14" width="84" height="16" rx="2" strokeWidth="1.3" />
          <rect x="8" y="34" width="39" height="16" rx="2" strokeWidth="1.3" />
          <rect x="53" y="34" width="39" height="16" rx="2" strokeWidth="1.3" />
          <rect x="8" y="54" width="24" height="14" rx="2" strokeWidth="1.3" />
          <rect x="38" y="54" width="24" height="14" rx="2" strokeWidth="1.3" />
          <rect x="68" y="54" width="24" height="14" rx="2" strokeWidth="1.3" />
        </svg>
      );

    // 4. javascript - code block & async
    case "code-block":
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 font-mono text-[10px] leading-relaxed text-amber-400/35 select-none"
        >
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-[9px] uppercase tracking-wider text-amber-400/80">async</span>
          </div>
          <span className="block">async () =&gt; &#123;</span>
          <span className="block pl-2 text-amber-300/60">await fetch();</span>
          <span className="block">&#125;</span>
        </div>
      );

    // 5. typescript - typed interface
    case "type-system":
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 font-mono text-[10px] leading-relaxed text-blue-400/35 select-none"
        >
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-[9px] uppercase tracking-wider text-blue-400/80">types</span>
          </div>
          <span className="block">interface User&lt;T&gt; &#123;</span>
          <span className="block pl-2 text-blue-300/60">readonly id: UUID;</span>
          <span className="block">&#125;</span>
        </div>
      );

    // 6. jquery - DOM selector
    case "dom-selector":
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 font-mono text-[10px] leading-relaxed text-cyan/35 select-none"
        >
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            <span className="text-[9px] uppercase tracking-wider text-cyan/80">dom</span>
          </div>
          <span className="block">$(&apos;#root&apos;)</span>
          <span className="block pl-2 text-cyan/60">.on(&apos;click&apos;)</span>
          <span className="block pl-2 text-cyan/40">.fadeIn();</span>
        </div>
      );

    // 7. react - component orbitals
    case "orbitals":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 text-cyan/25 select-none transition-transform duration-700 group-hover:rotate-12"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
        >
          <ellipse cx="50" cy="50" rx="42" ry="16" strokeWidth="1.2" transform="rotate(30 50 50)" />
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="16"
            strokeWidth="1.2"
            transform="rotate(-30 50 50)"
          />
          <ellipse cx="50" cy="50" rx="42" ry="16" strokeWidth="1.2" transform="rotate(90 50 50)" />
          <circle cx="50" cy="50" r="3.5" fill="currentColor" />
        </svg>
      );

    // 8. nextjs - route split
    case "route-split":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-slate-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="8" y="10" width="38" height="24" rx="3" strokeWidth="1.4" />
          <rect
            x="54"
            y="10"
            width="38"
            height="24"
            rx="3"
            strokeWidth="1.4"
            strokeDasharray="3 2"
          />
          <line x1="27" y1="34" x2="27" y2="52" strokeWidth="1.4" />
          <line x1="73" y1="34" x2="73" y2="52" strokeWidth="1.4" />
          <circle cx="50" cy="62" r="10" strokeWidth="1.4" />
          <line x1="27" y1="52" x2="42" y2="58" strokeWidth="1.2" />
          <line x1="73" y1="52" x2="58" y2="58" strokeWidth="1.2" />
        </svg>
      );

    // 9. nodejs - event loop
    case "event-loop":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-emerald-400/35 select-none transition-transform duration-700 group-hover:rotate-45"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="50" cy="40" r="28" strokeWidth="1.4" strokeDasharray="6 3" />
          <circle cx="50" cy="12" r="3.5" fill="currentColor" />
          <circle cx="78" cy="40" r="3.5" fill="currentColor" />
          <circle cx="50" cy="68" r="3.5" fill="currentColor" />
          <circle cx="22" cy="40" r="3.5" fill="currentColor" />
          <circle cx="50" cy="40" r="7" strokeWidth="1.2" />
        </svg>
      );

    // 10. php - server script
    case "server-script":
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 font-mono text-[10px] leading-relaxed text-indigo-400/35 select-none"
        >
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-[9px] uppercase tracking-wider text-indigo-400/80">&lt;?php</span>
          </div>
          <span className="block">$req = Request::get();</span>
          <span className="block pl-2 text-indigo-300/60">echo $req-&gt;json();</span>
          <span className="block text-indigo-400/70">?&gt;</span>
        </div>
      );

    // 11. laravel - MVC pipeline
    case "mvc-pipeline":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-rose-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="8" y="16" width="24" height="20" rx="3" strokeWidth="1.4" />
          <rect x="38" y="16" width="24" height="20" rx="3" strokeWidth="1.4" />
          <rect x="68" y="16" width="24" height="20" rx="3" strokeWidth="1.4" />
          <path d="M32 26H38M62 26H68" strokeWidth="1.4" strokeLinecap="round" />
          <rect
            x="23"
            y="48"
            width="54"
            height="18"
            rx="3"
            strokeWidth="1.4"
            strokeDasharray="3 2"
          />
          <line x1="50" y1="36" x2="50" y2="48" strokeWidth="1.4" />
        </svg>
      );

    // 12. rest-apis - API arrows
    case "api-arrows":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-teal-400/35 select-none transition-transform duration-700 group-hover:translate-x-1"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="6" y="24" width="28" height="32" rx="4" strokeWidth="1.4" />
          <rect x="66" y="24" width="28" height="32" rx="4" strokeWidth="1.4" />
          <line x1="38" y1="34" x2="62" y2="34" strokeWidth="1.5" />
          <polyline points="56,29 62,34 56,39" strokeWidth="1.5" />
          <line x1="62" y1="46" x2="38" y2="46" strokeWidth="1.5" />
          <polyline points="44,41 38,46 44,51" strokeWidth="1.5" />
        </svg>
      );

    // 13. python - terminal
    case "terminal":
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 font-mono text-[10px] leading-relaxed text-emerald-400/35 select-none"
        >
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] uppercase tracking-wider text-emerald-400/80">cli</span>
          </div>
          <span className="block">&gt;&gt;&gt; import app</span>
          <span className="block">&gt;&gt;&gt; app.run()</span>
          <span className="block text-emerald-300/60">&gt; build() ▋</span>
        </div>
      );

    // 14. c-programming - memory blocks
    case "memory-blocks":
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 font-mono text-[9px] leading-relaxed text-blue-400/35 select-none"
        >
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-[9px] uppercase tracking-wider text-blue-400/80">ptr</span>
          </div>
          <span className="block">0x7FFF: [0x4A]</span>
          <span className="block">0x7FFF: [0x12]</span>
          <span className="block text-blue-300/60">*ptr = alloc(4);</span>
        </div>
      );

    // 15. cpp - compiled system
    case "compiled-system":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-sky-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <polygon points="50,10 85,30 85,65 50,78 15,65 15,30" strokeWidth="1.4" />
          <line x1="50" y1="10" x2="50" y2="78" strokeWidth="1.2" />
          <line x1="50" y1="45" x2="85" y2="30" strokeWidth="1.2" />
          <line x1="50" y1="45" x2="15" y2="30" strokeWidth="1.2" />
        </svg>
      );

    // 16. java - JVM architecture
    case "jvm-architecture":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-amber-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="12" y="12" width="76" height="20" rx="3" strokeWidth="1.4" />
          <rect
            x="12"
            y="40"
            width="34"
            height="26"
            rx="3"
            strokeWidth="1.4"
            strokeDasharray="3 2"
          />
          <rect
            x="54"
            y="40"
            width="34"
            height="26"
            rx="3"
            strokeWidth="1.4"
            strokeDasharray="3 2"
          />
          <line x1="29" y1="32" x2="29" y2="40" strokeWidth="1.2" />
          <line x1="71" y1="32" x2="71" y2="40" strokeWidth="1.2" />
        </svg>
      );

    // 17. oop - class diagram
    case "class-diagram":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-violet-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="28" y="8" width="44" height="24" rx="2" strokeWidth="1.4" />
          <rect x="8" y="48" width="36" height="22" rx="2" strokeWidth="1.4" />
          <rect x="56" y="48" width="36" height="22" rx="2" strokeWidth="1.4" />
          <line x1="50" y1="32" x2="50" y2="40" strokeWidth="1.2" />
          <line x1="26" y1="40" x2="74" y2="40" strokeWidth="1.2" />
          <line x1="26" y1="40" x2="26" y2="48" strokeWidth="1.2" />
          <line x1="74" y1="40" x2="74" y2="48" strokeWidth="1.2" />
        </svg>
      );

    // 18. dsa - nodes tree
    case "dsa-nodes":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-purple-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="50" cy="18" r="7" strokeWidth="1.4" fill="currentColor" fillOpacity="0.3" />
          <circle cx="26" cy="45" r="6" strokeWidth="1.4" />
          <circle cx="74" cy="45" r="6" strokeWidth="1.4" />
          <circle cx="15" cy="68" r="4.5" strokeWidth="1.2" />
          <circle cx="37" cy="68" r="4.5" strokeWidth="1.2" />
          <circle cx="63" cy="68" r="4.5" strokeWidth="1.2" />
          <circle cx="85" cy="68" r="4.5" strokeWidth="1.2" />
          <line x1="45" y1="23" x2="31" y2="40" strokeWidth="1.2" />
          <line x1="55" y1="23" x2="69" y2="40" strokeWidth="1.2" />
          <line x1="23" y1="50" x2="17" y2="64" strokeWidth="1.2" />
          <line x1="29" y1="50" x2="35" y2="64" strokeWidth="1.2" />
          <line x1="71" y1="50" x2="65" y2="64" strokeWidth="1.2" />
          <line x1="77" y1="50" x2="83" y2="64" strokeWidth="1.2" />
        </svg>
      );

    // 19. git-github - branch tree
    case "branch-tree":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-orange-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <line x1="24" y1="12" x2="24" y2="68" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="20" r="4.5" fill="currentColor" />
          <circle cx="24" cy="44" r="4.5" fill="currentColor" />
          <circle cx="24" cy="64" r="4.5" fill="currentColor" />
          <path d="M24 20C48 20 68 28 68 44" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="68" cy="44" r="4.5" fill="currentColor" />
          <path d="M68 44C68 56 48 64 24 64" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    // 20. database-fundamentals - relational schema
    case "relational-schema":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-indigo-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="8" y="12" width="36" height="48" rx="3" strokeWidth="1.4" />
          <line x1="8" y1="24" x2="44" y2="24" strokeWidth="1.4" />
          <rect x="56" y="20" width="36" height="48" rx="3" strokeWidth="1.4" />
          <line x1="56" y1="32" x2="92" y2="32" strokeWidth="1.4" />
          <path d="M44 32C50 32 50 44 56 44" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      );

    // 21. sql - relational grid
    case "relational-grid":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-indigo-400/30 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="5" y="5" width="90" height="70" rx="4" strokeWidth="1.4" />
          <line x1="5" y1="24" x2="95" y2="24" strokeWidth="1.4" />
          <line x1="36" y1="5" x2="36" y2="75" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="68" y1="5" x2="68" y2="75" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="5" y1="48" x2="95" y2="48" strokeWidth="1" strokeDasharray="3 2" />
        </svg>
      );

    // 22. postgresql - advanced DB
    case "advanced-db":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-blue-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <ellipse cx="50" cy="18" rx="36" ry="10" strokeWidth="1.4" />
          <path d="M14 18V60C14 65.5 30 70 50 70C70 70 86 65.5 86 60V18" strokeWidth="1.4" />
          <path
            d="M14 38C14 43.5 30 48 50 48C70 48 86 43.5 86 38"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
          <circle cx="50" cy="58" r="2.5" fill="currentColor" />
        </svg>
      );

    // 23. mysql - table records
    case "table-records":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-amber-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="8" y="10" width="84" height="60" rx="3" strokeWidth="1.4" />
          <line x1="8" y1="26" x2="92" y2="26" strokeWidth="1.4" />
          <line x1="32" y1="10" x2="32" y2="70" strokeWidth="1.2" />
          <circle cx="20" cy="40" r="2.5" fill="currentColor" />
          <circle cx="20" cy="55" r="2.5" fill="currentColor" />
          <line x1="42" y1="40" x2="80" y2="40" strokeWidth="1.2" />
          <line x1="42" y1="55" x2="70" y2="55" strokeWidth="1.2" />
        </svg>
      );

    // 24. mongodb - document tree
    case "document-tree":
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 font-mono text-[10px] leading-relaxed text-emerald-400/35 select-none"
        >
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] uppercase tracking-wider text-emerald-400/80">bson</span>
          </div>
          <span className="block">&#123; &quot;_id&quot;: ObjectId,</span>
          <span className="block pl-2 text-emerald-300/60">&quot;doc&quot;: [ ... ]</span>
          <span className="block">&#125;</span>
        </div>
      );

    // 25. numpy - matrix array
    case "matrix-array":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-sky-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <path d="M16 14H10V66H16" strokeWidth="1.8" />
          <path d="M84 14H90V66H84" strokeWidth="1.8" />
          <rect x="22" y="20" width="14" height="12" rx="1" fill="currentColor" fillOpacity="0.3" />
          <rect x="43" y="20" width="14" height="12" rx="1" strokeWidth="1" />
          <rect x="64" y="20" width="14" height="12" rx="1" strokeWidth="1" />
          <rect x="22" y="38" width="14" height="12" rx="1" strokeWidth="1" />
          <rect x="43" y="38" width="14" height="12" rx="1" fill="currentColor" fillOpacity="0.3" />
          <rect x="64" y="38" width="14" height="12" rx="1" strokeWidth="1" />
          <rect x="22" y="56" width="14" height="12" rx="1" strokeWidth="1" />
          <rect x="43" y="56" width="14" height="12" rx="1" strokeWidth="1" />
          <rect x="64" y="56" width="14" height="12" rx="1" fill="currentColor" fillOpacity="0.3" />
        </svg>
      );

    // 26. pandas - dataframe table
    case "dataframe-table":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-indigo-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="6" y="8" width="88" height="64" rx="3" strokeWidth="1.4" />
          <line x1="6" y1="24" x2="94" y2="24" strokeWidth="1.4" />
          <line x1="28" y1="8" x2="28" y2="72" strokeWidth="1.2" />
          <line x1="62" y1="8" x2="62" y2="72" strokeWidth="1.2" />
          <line x1="6" y1="44" x2="94" y2="44" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="6" y1="58" x2="94" y2="58" strokeWidth="1" strokeDasharray="3 2" />
        </svg>
      );

    // 27. matplotlib - chart visualization
    case "chart-visualization":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-teal-400/35 select-none transition-transform duration-700 group-hover:translate-y-[-2px]"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <line x1="12" y1="12" x2="12" y2="68" strokeWidth="1.5" />
          <line x1="12" y1="68" x2="92" y2="68" strokeWidth="1.5" />
          <polyline points="16,56 36,44 56,52 74,28 90,16" strokeWidth="1.8" />
          <circle cx="36" cy="44" r="3" fill="currentColor" />
          <circle cx="56" cy="52" r="3" fill="currentColor" />
          <circle cx="74" cy="28" r="3" fill="currentColor" />
          <circle cx="90" cy="16" r="3" fill="currentColor" />
        </svg>
      );

    // 28. statistics-for-data - distribution histogram
    case "distribution-histogram":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-gold/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="12" y="52" width="10" height="18" fill="currentColor" fillOpacity="0.25" />
          <rect x="26" y="38" width="10" height="32" fill="currentColor" fillOpacity="0.3" />
          <rect x="40" y="20" width="10" height="50" fill="currentColor" fillOpacity="0.4" />
          <rect x="54" y="24" width="10" height="46" fill="currentColor" fillOpacity="0.4" />
          <rect x="68" y="42" width="10" height="28" fill="currentColor" fillOpacity="0.3" />
          <rect x="82" y="56" width="10" height="14" fill="currentColor" fillOpacity="0.25" />
          <path d="M8 65Q25 60 38 30T58 20T76 45T94 68" strokeWidth="1.5" fill="none" />
          <line x1="8" y1="70" x2="96" y2="70" strokeWidth="1.4" />
        </svg>
      );

    // 29. data-analysis-foundations - analytical chart
    case "analytical-chart":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-20 w-28 text-gold/30 select-none transition-transform duration-700 group-hover:translate-y-[-2px]"
          viewBox="0 0 100 60"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="8,48 28,34 48,40 68,18 92,10" strokeWidth="2" />
          <rect x="22" y="34" width="6" height="14" fill="currentColor" fillOpacity="0.35" />
          <rect x="42" y="40" width="6" height="8" fill="currentColor" fillOpacity="0.35" />
          <rect x="62" y="18" width="6" height="30" fill="currentColor" fillOpacity="0.35" />
          <rect x="82" y="10" width="6" height="38" fill="currentColor" fillOpacity="0.35" />
          <line x1="4" y1="48" x2="96" y2="48" strokeWidth="1.4" />
        </svg>
      );

    // 30. data-science-foundations - data pipeline
    case "data-pipeline":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-cyan/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="8" y="24" width="22" height="32" rx="3" strokeWidth="1.4" />
          <rect x="40" y="24" width="22" height="32" rx="3" strokeWidth="1.4" />
          <rect
            x="72"
            y="24"
            width="22"
            height="32"
            rx="3"
            strokeWidth="1.4"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <line x1="30" y1="40" x2="40" y2="40" strokeWidth="1.4" />
          <line x1="62" y1="40" x2="72" y2="40" strokeWidth="1.4" />
          <circle cx="19" cy="34" r="2" fill="currentColor" />
          <circle cx="51" cy="40" r="2" fill="currentColor" />
          <circle cx="83" cy="46" r="2" fill="currentColor" />
        </svg>
      );

    // 31. ai-ml-foundations - model pipeline
    case "model-pipeline":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-32 text-purple-400/30 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 120 70"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="18" cy="22" r="5" strokeWidth="1.4" />
          <circle cx="18" cy="48" r="5" strokeWidth="1.4" />
          <circle cx="58" cy="16" r="5" strokeWidth="1.4" />
          <circle cx="58" cy="35" r="5" strokeWidth="1.4" />
          <circle cx="58" cy="54" r="5" strokeWidth="1.4" />
          <circle cx="98" cy="35" r="5" strokeWidth="1.4" fill="currentColor" fillOpacity="0.5" />
          <line x1="23" y1="22" x2="53" y2="16" strokeWidth="1" />
          <line x1="23" y1="22" x2="53" y2="35" strokeWidth="1" />
          <line x1="23" y1="48" x2="53" y2="35" strokeWidth="1" />
          <line x1="23" y1="48" x2="53" y2="54" strokeWidth="1" />
          <line x1="63" y1="16" x2="93" y2="35" strokeWidth="1" />
          <line x1="63" y1="35" x2="93" y2="35" strokeWidth="1" />
          <line x1="63" y1="54" x2="93" y2="35" strokeWidth="1" />
        </svg>
      );

    // 32. scikit-learn - ML estimator
    case "ml-estimator":
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-24 w-28 text-amber-400/35 select-none transition-transform duration-700 group-hover:scale-105"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
        >
          <rect x="8" y="16" width="28" height="22" rx="3" strokeWidth="1.4" />
          <rect
            x="64"
            y="16"
            width="28"
            height="22"
            rx="3"
            strokeWidth="1.4"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <circle cx="50" cy="54" r="16" strokeWidth="1.4" strokeDasharray="4 2" />
          <line x1="36" y1="27" x2="42" y2="44" strokeWidth="1.2" />
          <line x1="58" y1="44" x2="64" y2="27" strokeWidth="1.2" />
          <circle cx="50" cy="54" r="3.5" fill="currentColor" />
        </svg>
      );

    default:
      return null;
  }
}

/**
 * CourseVisual: Renders the distinctive, high-end technical header for any course card or course detail page.
 */
export function CourseVisual({
  visual,
  iconName,
  className,
}: {
  visual: CourseCatalogVisual;
  iconName?: string;
  className?: string;
}) {
  const icon = iconName || visual.iconName;

  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br transition-all duration-500",
        visual.bgGradient,
        className,
      )}
    >
      {/* Background ambient technical glow */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-125",
          visual.glowColor,
        )}
      />

      {/* Unique SVG / Vector Technical Motif */}
      <CourseVisualMotifRenderer motif={visual.motif} accentColor={visual.accentColor} />

      {/* Floating glass icon container */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
        <span className="glass grid h-10 w-10 place-items-center rounded-xl text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-110">
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>

      {/* Technical domain badge */}
      <div className="absolute left-3 top-3">
        <span className="glass inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-primary-foreground/90 uppercase shadow-xs">
          {visual.badge}
        </span>
      </div>
    </div>
  );
}
