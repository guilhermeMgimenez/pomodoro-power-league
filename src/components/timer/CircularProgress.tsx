import { useEffect, useState } from "react";

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const CircularProgress = ({
  progress,
  size = 320,
  strokeWidth = 10,
  color = "hsl(var(--primary))",
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;
  // Render the first frame at the correct value with no transition, then animate only later changes.
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  // A big jump (reset / new session) should snap instead of sweeping.
  const [last, setLast] = useState(progress);
  const jump = Math.abs(progress - last) > 10;
  useEffect(() => { setLast(progress); }, [progress]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--foreground))" strokeWidth={strokeWidth} opacity={0.08} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: animate && !jump ? "stroke-dashoffset 300ms linear" : "none",
          filter: `drop-shadow(0 0 12px ${color})`,
        }}
      />
    </svg>
  );
};
