import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'अघोर पीठ आश्रम',
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F2ECE1] to-[#E4DACB] text-[#6B5B4E] dark:from-[#26201B] dark:to-[#1A1512] dark:text-[#C7B9A8] ${className}`}
      >
        <BookOpen className="h-8 w-8 opacity-60" strokeWidth={1.5} />
        <span className="mt-2 px-4 text-center text-xs font-medium tracking-wide">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
