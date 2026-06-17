import { Compass } from 'lucide-react';

type AppLogoProps = {
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClasses = {
  sm: { box: 'w-10 h-10', icon: 'w-5 h-5' },
  md: { box: 'w-16 h-16', icon: 'w-8 h-8' },
} as const;

export function AppLogo({ size = 'sm', className = '' }: AppLogoProps) {
  const { box, icon } = sizeClasses[size];

  return (
    <div
      className={`${box} rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 ${className}`}
    >
      <Compass className={icon} strokeWidth={2.5} />
    </div>
  );
}
