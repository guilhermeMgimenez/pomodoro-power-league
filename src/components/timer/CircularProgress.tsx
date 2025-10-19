interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const CircularProgress = ({ 
  progress, 
  size = 320, 
  strokeWidth = 12,
  color = "hsl(var(--primary))"
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={strokeWidth}
        opacity={0.3}
      />
      {/* Progress circle */}
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
        className="transition-all duration-500"
        style={{
          filter: `drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color})`
        }}
      />
    </svg>
  );
};
