import logoAsset from "@/assets/focus-time-logo.png.asset.json";

export const BrandLogo = ({ className = "", decorative = false }: { className?: string; decorative?: boolean }) => (
  <img
    src={logoAsset.url}
    alt={decorative ? "" : "Focus Time"}
    width={202}
    height={225}
    className={`shrink-0 object-contain ${className}`}
  />
);