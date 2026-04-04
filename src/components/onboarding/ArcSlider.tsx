import { useId, useRef } from "react";
import { cn } from "@/lib/utils";

interface ArcSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  lowLabel: string;
  highLabel: string;
  hue?: number;
  className?: string;
  onChange: (value: number) => void;
}

const VIEWBOX_WIDTH = 320;
const VIEWBOX_HEIGHT = 220;
const CENTER_X = 160;
const CENTER_Y = 168;
const RADIUS = 112;
const START_ANGLE = 204;
const END_ANGLE = 336;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export function ArcSlider({
  value,
  min,
  max,
  step = 1,
  unit,
  lowLabel,
  highLabel,
  hue = 258,
  className,
  onChange,
}: ArcSliderProps) {
  const sliderId = useId();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);
  const clampedValue = clamp(value, min, max);
  const ratio = (clampedValue - min) / (max - min);
  const currentAngle = START_ANGLE + ratio * (END_ANGLE - START_ANGLE);
  const activePath = describeArc(CENTER_X, CENTER_Y, RADIUS, START_ANGLE, currentAngle);
  const trackPath = describeArc(CENTER_X, CENTER_Y, RADIUS, START_ANGLE, END_ANGLE);
  const knob = polarToCartesian(CENTER_X, CENTER_Y, RADIUS, currentAngle);
  const activeStroke = `hsl(${hue} 72% 54%)`;
  const glowStroke = `hsl(${hue} 82% 68% / 0.5)`;
  const trackStroke = `hsl(${hue} 34% 84%)`;

  const updateFromPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * VIEWBOX_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT;
    const rawAngle = (Math.atan2(y - CENTER_Y, x - CENTER_X) * 180) / Math.PI;
    const normalizedAngle = rawAngle < 0 ? rawAngle + 360 : rawAngle;
    const boundedAngle = clamp(normalizedAngle, START_ANGLE, END_ANGLE);
    const nextRatio = (boundedAngle - START_ANGLE) / (END_ANGLE - START_ANGLE);
    const rawValue = min + nextRatio * (max - min);
    const roundedValue = Math.round(rawValue / step) * step;

    onChange(clamp(roundedValue, min, max));
  };

  const nudge = (direction: -1 | 1) => {
    onChange(clamp(clampedValue + step * direction, min, max));
  };

  return (
    <div className={cn("space-y-5", className)}>
      <div
        className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-5 shadow-[0_24px_60px_-28px_rgba(74,58,255,0.38)] backdrop-blur-xl"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            nudge(-1);
          }

          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            nudge(1);
          }
        }}
        tabIndex={0}
        role="slider"
        aria-label={unit}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
      >
        <div className="absolute inset-x-10 top-10 h-28 rounded-full bg-white/55 blur-3xl" />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="relative z-10 w-full touch-none select-none"
          onPointerDown={(event) => {
            isDraggingRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            updateFromPoint(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (!isDraggingRef.current) return;
            updateFromPoint(event.clientX, event.clientY);
          }}
          onPointerUp={() => {
            isDraggingRef.current = false;
          }}
          onPointerCancel={() => {
            isDraggingRef.current = false;
          }}
        >
          <defs>
            <linearGradient id={sliderId} x1="0%" x2="100%">
              <stop offset="0%" stopColor={glowStroke} />
              <stop offset="50%" stopColor={activeStroke} />
              <stop offset="100%" stopColor={`hsl(${hue + 24} 78% 60%)`} />
            </linearGradient>
          </defs>

          <path
            d={trackPath}
            fill="none"
            stroke={trackStroke}
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d={activePath}
            fill="none"
            stroke={`url(#${sliderId})`}
            strokeWidth="16"
            strokeLinecap="round"
          />

          {Array.from({ length: 5 }).map((_, index) => {
            const tickAngle = START_ANGLE + ((END_ANGLE - START_ANGLE) / 4) * index;
            const outer = polarToCartesian(CENTER_X, CENTER_Y, RADIUS + 14, tickAngle);
            const inner = polarToCartesian(CENTER_X, CENTER_Y, RADIUS - 10, tickAngle);

            return (
              <line
                key={tickAngle}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="hsl(240 16% 72%)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          <circle cx={knob.x} cy={knob.y} r="15" fill="white" stroke={activeStroke} strokeWidth="6" />
          <circle cx={knob.x} cy={knob.y} r="4" fill={activeStroke} />
        </svg>

        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center pt-7 text-center">
          <span className="text-5xl font-semibold tracking-tight text-foreground tabular-nums">
            {clampedValue}
          </span>
          <span className="mt-1 text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {unit}
          </span>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clampedValue}
          onChange={(event) => onChange(Number(event.target.value))}
          className="sr-only"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between gap-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
