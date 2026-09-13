import type { ImgHTMLAttributes } from 'react';
/** Images are optimized at asset creation; no provider-specific image server. */
export default function SiteImage({
  unoptimized: _unoptimized,
  priority,
  loading,
  alt,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & {
  unoptimized?: boolean;
  priority?: boolean;
}) {
  return (
    <img
      {...props}
      alt={alt}
      loading={loading || (priority ? 'eager' : 'lazy')}
      decoding="async"
      fetchPriority={priority ? 'high' : props.fetchPriority}
    />
  );
}
