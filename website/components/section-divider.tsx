import { useEffect, useRef, useState } from 'react';
import styles from './section-divider.module.css';

/** A finite scroll response. Art remains visible without JavaScript. */
export function SectionDivider({ variant }: { variant: 'truck' | 'star' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        setArrived(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${styles.divider} ${styles[variant]}`} data-section-divider={variant} data-arrived={arrived} aria-hidden="true">
      <svg className={styles.sweep} viewBox="0 0 1200 160" preserveAspectRatio="none">
        <path d="M0 115C220 115 294 38 530 67S904 134 1200 46" />
        <path d="M0 124C218 125 331 69 525 84S919 153 1200 55" />
      </svg>
      <img className={styles.vehicle} src="/brand/haul-flight-atomic.webp" alt="" width="1100" height="450" />
      <svg className={styles.spark} width="38" height="64" viewBox="0 0 38 64">
        <path d="M19 0 23 25 38 32 23 39 19 64 15 39 0 32 15 25Z" />
      </svg>
    </div>
  );
}
