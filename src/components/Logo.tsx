const logoUrl = "/logo.png";

interface LogoProps {
  height?: number;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

// Aspect ratio of the source PNG: 512 x 171.
const NATIVE_W = 512;
const NATIVE_H = 171;

export function Logo({ height = 40, className, title = "EasyFileMagic logo", style }: LogoProps) {
  const width = Math.round((height * NATIVE_W) / NATIVE_H);
  return (
    <img
      src={logoUrl}
      alt={title}
      width={width}
      height={height}
      style={{ height, width, ...style }}
      className={className}
      decoding="async"
      loading="eager"
    />
  );
}

export function LogoMark({
  size = 32,
  className,
  title = "EasyFileMagic",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <img
      src={logoUrl}
      alt={title}
      width={size}
      height={size}
      style={{ height: size, width: size, objectFit: "contain" }}
      className={className}
      decoding="async"
    />
  );
}
