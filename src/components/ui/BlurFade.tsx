import { ReactNode } from 'react';

interface BlurFadeProps {
  children: ReactNode;
  delay?: number;
  inView?: boolean;
}

export function BlurFade({ children, delay = 0, inView = true }: BlurFadeProps) {
  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        inView
          ? 'opacity-100 blur-0 translate-y-0'
          : 'opacity-0 blur-sm translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
} 