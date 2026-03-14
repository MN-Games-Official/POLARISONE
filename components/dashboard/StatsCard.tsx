'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color?: string;
  prefix?: string;
  suffix?: string;
  sparklineData?: number[];
  className?: string;
}

function useAnimatedCounter(target: number, duration = 1800): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;

    const easeOutExpo = (t: number): number =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setCount(Math.round(easedProgress * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return count;
}

function Sparkline({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-[2px] h-8 mt-2">
      {data.map((val, i) => {
        const height = ((val - min) / range) * 100;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-500 ease-out opacity-60 hover:opacity-100"
            style={{
              height: `${Math.max(height, 8)}%`,
              backgroundColor: color,
              animationDelay: `${i * 60}ms`,
              animation: 'sparkline-rise 0.6s ease-out forwards',
              transform: 'scaleY(0)',
              transformOrigin: 'bottom',
            }}
          />
        );
      })}
    </div>
  );
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = '#ff4b6e',
  prefix = '',
  suffix = '',
  sparklineData,
  className,
}) => {
  const animatedValue = useAnimatedCounter(value);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleVisibility = useCallback(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cleanup = handleVisibility();
    return cleanup;
  }, [handleVisibility]);

  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const defaultSparkline = [30, 45, 28, 55, 42, 67, 53, 78, 62, 85, 70, 90];

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
          'stats-card relative overflow-hidden rounded-xl p-5',
          'bg-[#1f2933] border border-[#2d3748]',
          'transition-all duration-500 ease-out cursor-default',
          'hover:shadow-2xl hover:-translate-y-1',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          className
        )}
        style={{
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Gradient border overlay on hover */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `linear-gradient(135deg, ${color}33, transparent, ${color}22)`,
            padding: '1px',
          }}
        />

        {/* Glow effect */}
        <div
          className="absolute -inset-1 rounded-xl blur-xl transition-opacity duration-700 pointer-events-none"
          style={{
            opacity: isHovered ? 0.15 : 0,
            backgroundColor: color,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div
              className="p-2.5 rounded-lg transition-all duration-300"
              style={{
                backgroundColor: `${color}18`,
                boxShadow: isHovered ? `0 0 20px ${color}30` : 'none',
              }}
            >
              <Icon
                size={22}
                style={{ color }}
                className="transition-transform duration-300"
              />
            </div>

            <div
              className={clsx(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'
              )}
            >
              <TrendIcon size={13} />
              <span>{Math.abs(change)}%</span>
            </div>
          </div>

          <p className="text-[#a0aec0] text-sm font-medium mb-1">{title}</p>
          <p className="text-[#e2e8f0] text-2xl font-bold tracking-tight">
            {prefix}
            {animatedValue.toLocaleString()}
            {suffix}
          </p>

          <Sparkline data={sparklineData || defaultSparkline} color={color} />
        </div>
      </div>

      <style jsx>{`
        @keyframes sparkline-rise {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }
      `}</style>
    </>
  );
};

StatsCard.displayName = 'StatsCard';
export default StatsCard;
