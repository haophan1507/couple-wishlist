"use client";

import { Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

type HeartSection = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  accent?: boolean;
  muted?: boolean;
};

type HeartDiagramProps = {
  sections: HeartSection[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
};

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 980;
const CENTER_X = VIEWBOX_WIDTH / 2;
const CENTER_Y = 420;
const SCALE_X = 30;
const SCALE_Y = 29.8;

function heartPointAt(t: number) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return {
    x: CENTER_X + x * SCALE_X,
    y: CENTER_Y - y * SCALE_Y,
  };
}

function buildHeartBoundary(sampleCount = 500) {
  const points: Array<[number, number]> = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const t = (i / sampleCount) * Math.PI * 2;
    const p = heartPointAt(t);
    points.push([p.x, p.y]);
  }
  return points;
}

function getEvenPointsAlongBoundary(
  boundary: Array<[number, number]>,
  count: number,
) {
  if (!boundary.length || count <= 0) return [];
  if (count === 1) {
    const top = boundary.reduce((best, point) => (point[1] < best[1] ? point : best), boundary[0]);
    return [{ x: top[0], y: top[1] }];
  }

  const lengths: number[] = [0];
  let totalLength = 0;
  for (let i = 1; i <= boundary.length; i += 1) {
    const prev = boundary[i - 1];
    const next = boundary[i % boundary.length];
    totalLength += Math.hypot(next[0] - prev[0], next[1] - prev[1]);
    lengths.push(totalLength);
  }

  const points: Array<{ x: number; y: number }> = [];
  const startShift = totalLength * 0.12;

  for (let i = 0; i < count; i += 1) {
    const target = (startShift + (i * totalLength) / count) % totalLength;
    let segment = 1;
    while (segment < lengths.length && lengths[segment] < target) {
      segment += 1;
    }

    const a = boundary[(segment - 1) % boundary.length];
    const b = boundary[segment % boundary.length];
    const segStart = lengths[segment - 1];
    const segEnd = lengths[segment];
    const ratio = segEnd > segStart ? (target - segStart) / (segEnd - segStart) : 0;

    points.push({
      x: a[0] + (b[0] - a[0]) * ratio,
      y: a[1] + (b[1] - a[1]) * ratio,
    });
  }

  return points;
}

export function HeartDiagram({ sections, selectedId, onSelect, className }: HeartDiagramProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const boundary = useMemo(() => buildHeartBoundary(), []);

  const layout = useMemo(() => {
    const perimeter = getEvenPointsAlongBoundary(boundary, sections.length);
    const compact = sections.length > 16;

    return sections.map((section, index) => {
      const point = perimeter[index] ?? { x: CENTER_X, y: CENTER_Y - 130 };
      const angle = Math.atan2(point.y - CENTER_Y, point.x - CENTER_X);
      const bubbleDistance = compact ? 62 + (index % 2) * 8 : 74 + (index % 3) * 9;
      const rawBubbleX = point.x - Math.cos(angle) * bubbleDistance;
      const rawBubbleY = point.y - Math.sin(angle) * bubbleDistance;
      const bubbleX = Math.max(150, Math.min(VIEWBOX_WIDTH - 150, rawBubbleX));
      const bubbleY = Math.max(82, Math.min(VIEWBOX_HEIGHT - 82, rawBubbleY));

      return {
        section,
        point,
        bubbleX,
        bubbleY,
      };
    });
  }, [boundary, sections]);

  return (
    <div className={cn("mx-auto w-full max-w-[1080px]", className)}>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="h-auto w-full">
        <defs>
          <linearGradient id="heart-main-gradient" x1="10%" y1="4%" x2="90%" y2="94%">
            <stop offset="0%" stopColor="#ffd6e8" />
            <stop offset="55%" stopColor="#ffe8f0" />
            <stop offset="100%" stopColor="#d4f0ff" />
          </linearGradient>
          <filter id="heart-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#b57f8f" floodOpacity="0.24" />
          </filter>
        </defs>

        <path
          d={`M ${boundary.map(([x, y]) => `${x},${y}`).join(" L ")} Z`}
          fill="url(#heart-main-gradient)"
          stroke="#c4869c"
          strokeWidth="3"
          filter="url(#heart-soft-shadow)"
        />

        {layout.map(({ section, point, bubbleX, bubbleY }) => (
          <g
            key={section.id}
            onClick={() => onSelect?.(section.id)}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                setHoveredId(section.id);
              }
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") {
                setHoveredId((current) => (current === section.id ? null : current));
              }
            }}
            onTouchStart={() => setHoveredId(section.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.(section.id);
              }
            }}
            onFocus={() => setHoveredId(section.id)}
            onBlur={() => setHoveredId((current) => (current === section.id ? null : current))}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={section.title}
          >
            {(() => {
              const isActive = hoveredId === section.id || selectedId === section.id;
              const isMuted = section.muted && selectedId !== section.id;
              return (
                <g transform={`translate(${point.x},${point.y})`} className="transition-transform duration-200" style={{ transformOrigin: `${point.x}px ${point.y}px` }}>
                  <circle r={24} fill="transparent" />
                  <circle
                    r={isActive ? 18.5 : 15.5}
                    fill={
                      section.id === selectedId
                        ? "#d97c95"
                        : isMuted
                          ? "rgba(232,164,183,0.42)"
                          : "#e8a4b7"
                    }
                    stroke="#ffffff"
                    strokeWidth="2.8"
                    opacity={isMuted ? 0.72 : 1}
                    className="transition-all duration-200"
                  />
                  <Heart
                    x={isActive ? -8 : -7.2}
                    y={isActive ? -8 : -7.2}
                    width={isActive ? 16 : 14.4}
                    height={isActive ? 16 : 14.4}
                    fill={isMuted ? "rgba(255,255,255,0.8)" : "#ffffff"}
                    stroke={isMuted ? "rgba(255,255,255,0.8)" : "#ffffff"}
                    opacity={isMuted ? 0.9 : 1}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })()}

            {hoveredId === section.id || selectedId === section.id ? (
              <g transform={`translate(${bubbleX},${bubbleY})`} pointerEvents="none">
                <rect
                  x={-140}
                  y={-48}
                  width={280}
                  height={96}
                  rx={18}
                  fill="rgba(255,255,255,0.9)"
                  stroke={section.id === selectedId ? "#b96a80" : "#d3a8b7"}
                  strokeWidth="1.2"
                />
                <text
                  x={-120}
                  y={-12}
                  textAnchor="start"
                  fontSize={18}
                  fill="#5c3a45"
                  fontWeight={800}
                  className="font-[var(--font-heading)]"
                >
                  {section.title.length > 24 ? `${section.title.slice(0, 23)}...` : section.title}
                </text>
                {section.description ? (
                  <text
                    x={-120}
                    y={16}
                    textAnchor="start"
                    fontSize={14.5}
                    fill="#7b5b65"
                    fontWeight={500}
                    className="font-[var(--font-body)]"
                  >
                    {section.description.length > 27
                      ? `${section.description.slice(0, 26)}...`
                      : section.description}
                  </text>
                ) : null}
              </g>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}
