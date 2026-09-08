'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { photoSelectionError } from '@/lib/photo-limits';

function PhotoPreview({ file }: { file: File }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const preview = URL.createObjectURL(file);
    const frame = requestAnimationFrame(() => setUrl(preview));
    return () => {
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(preview);
    };
  }, [file]);
  return url ? (
    <Image unoptimized src={url} alt={file.name} width={100} height={80} />
  ) : null;
}

export function PhotoUpload({
  files,
  onChange,
  error,
  onError,
  disabled,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
  onError: (error?: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="photo-upload">
      <label htmlFor="pickup-photos">
        <Camera size={21} aria-hidden="true" /> Show us what’s going{' '}
        <span>(optional)</span>
      </label>
      <p id="photos-help">
        Up to 5 JPG, PNG, or WebP photos. Maximum 5 MB each, 10 MB combined.
        Photos go to our crew with your request.
      </p>
      <input
        id="pickup-photos"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={`photos-help photos-count${error ? ' photos-error' : ''}`}
        onChange={(event) => {
          const next = [...files, ...Array.from(event.target.files || [])];
          const problem = photoSelectionError(next);
          onError(problem);
          if (!problem) onChange(next);
          event.target.value = '';
        }}
      />
      {error && (
        <p id="photos-error" className="field-error" role="alert">
          {error}
        </p>
      )}
      <output id="photos-count" className="photo-count">
        {files.length
          ? `${files.length} of 5 photos selected`
          : 'No photos selected'}
      </output>
      {files.length > 0 && (
        <ul className="photo-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.lastModified}-${index}`}>
              <PhotoPreview file={file} />
              <span>
                {file.name}
                <small>
                  {file.size < 1024 * 1024
                    ? `${Math.max(1, Math.round(file.size / 1024))} KB`
                    : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                </small>
              </span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove photo ${index + 1}: ${file.name}`}
                onClick={() => {
                  onChange(files.filter((_, i) => i !== index));
                  onError();
                  document.getElementById('pickup-photos')?.focus();
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="photo-note">
        Avoid faces, personal documents, and anything you don’t want to share.
        Embedded location metadata is removed before emailing.
      </p>
      <details className="photo-tips">
        <summary>What makes a useful photo?</summary>
        <ul>
          <li>One wide shot so we can see the full pile.</li>
          <li>A closer look at items that need special handling.</li>
          <li>
            A view of stairs or access, if helpful. No need to move anything
            heavy.
          </li>
        </ul>
      </details>
    </div>
  );
}
