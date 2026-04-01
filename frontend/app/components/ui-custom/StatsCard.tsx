import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  iconBgStyle?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  iconBgColor = '',
  iconColor = '',
  iconBgStyle,
  iconStyle,
  delay = 0,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-xl border border-gray-200 p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group transform-gpu ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 tabular-nums">
            {displayValue.toLocaleString()}
          </h3>
          {change && (
            <p
              className={`text-sm mt-2 font-medium ${
                changeType === 'positive'
                  ? 'text-emerald-600'
                  : changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {changeType === 'positive' && '+'}
              {changeType === 'negative' && '-'}
              {change}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconBgColor}`}
          style={iconBgStyle}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} style={iconStyle} />
        </div>
      </div>
    </div>
  );
}
