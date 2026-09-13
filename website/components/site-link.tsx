import { Link, type LinkProps } from 'react-router';
/** Site-owned link contract keeps content URLs and draft-safe links consistent. */
export default function SiteLink({
  href,
  prefetch: _prefetch,
  ...props
}: Omit<LinkProps, 'to' | 'prefetch'> & { href: string; prefetch?: boolean }) {
  return <Link {...props} to={href} />;
}
