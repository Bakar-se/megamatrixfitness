import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  isLoading: boolean;
  size?: number;
  className?: string;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  isLoading,
  size = 24,
  className,
  text = 'Loading...'
}) => {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        className
      )}
    >
      <Loader2 className='text-primary animate-spin' size={size} />
    </div>
  );
};

export default Loader;
