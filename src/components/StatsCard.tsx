import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  gradient: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon,
  gradient,
  subtitle,
  onClick,
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 text-white
        ${gradient}
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-2xl
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full bg-white/5 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">{value}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
            {icon}
          </div>
        </div>

        {subtitle && (
          <p className="text-white/70 text-xs mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
