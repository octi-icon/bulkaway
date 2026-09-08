import type { CSSProperties } from 'react';

export function SparkleRays({ rays }: { rays: number[][] }) {
  return (
    <>
      {rays.map(([x, y], index) => (
        <svg
          key={index}
          className="atomic-spark-particle"
          viewBox="-1 -1 22 30"
          focusable="false"
          style={
            {
              '--spark-x': `${x}px`,
              '--spark-y': `${y}px`,
              '--spark-turn': `${index % 2 ? 38 : -30}deg`,
              '--spark-color':
                index % 3 === 0
                  ? 'var(--cream)'
                  : index % 2
                    ? 'var(--lime)'
                    : 'var(--gold)',
            } as CSSProperties
          }
        >
          <path
            d="M10 0 12 11 20 14 12 17 10 28 8 17 0 14 8 11Z"
            fill="var(--spark-color)"
            stroke="var(--ink)"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </>
  );
}
