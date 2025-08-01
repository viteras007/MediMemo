interface BorderBeamProps {
  colorFrom: string;
  colorTo: string;
}

export function BorderBeam({ colorFrom, colorTo }: BorderBeamProps) {
  return (
    <div
      className="absolute inset-0 rounded-lg border border-transparent [background:linear-gradient(var(--tw-gradient-stops))] from-transparent via-white/20 to-transparent [--tw-gradient-from:transparent] [--tw-gradient-to:transparent] [--tw-gradient-stops:transparent_0%,var(--tw-gradient-from)_50%,var(--tw-gradient-to)_100%]"
      style={{
        '--tw-gradient-from': colorFrom,
        '--tw-gradient-to': colorTo,
      } as React.CSSProperties}
    />
  );
} 