type BrandWordmarkProps = {
  className?: string;
};

export function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span
      className={`brand-wordmark ${className}`.trim()}
      role="img"
      aria-label="SkazKIDS"
    >
      <span aria-hidden="true" className="brand-wordmark__skaz">
        Skaz
      </span>
      <span aria-hidden="true" className="brand-wordmark__kids">
        KIDS
      </span>
    </span>
  );
}
