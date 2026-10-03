import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type HomeImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Above-the-fold image: eager + high fetch priority. Everything else lazy-loads. */
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Shown instead of a broken-image icon if the file is missing or fails to load. */
  fallback?: ReactNode;
};

/**
 * Plain <img> with explicit dimensions (no layout shift) and a branded fallback.
 * SSR renders the <img>; if the file 404s, the client swaps in the fallback after hydration
 * (the effect also catches failures that happened before hydration finished).
 */
export function HomeImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes,
  className,
  fallback,
}: HomeImageProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node && node.complete && node.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "grid place-items-center bg-gradient-hero bg-tech-grid text-primary-foreground/70",
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
