'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useHaulList } from '@/components/haul-list';

// Keep the actual form (including selected Files) mounted during reading detours.
// Personal information is never copied into browser storage.
export function DraftSafeLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  const { items, requestStarted, requestComplete } = useHaulList();
  const preserveRequest =
    !requestComplete && (requestStarted || items.length > 0);
  return (
    <Link
      {...props}
      target={preserveRequest ? '_blank' : props.target}
      rel={preserveRequest ? 'noopener noreferrer' : props.rel}
    >
      {children}
      {preserveRequest && (
        <span className="draft-link-note">
          New tab · keeps your request here
        </span>
      )}
    </Link>
  );
}
