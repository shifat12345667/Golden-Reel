
import React from 'react';

interface LoaderProps {
  small?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ small = false }) => {
  const sizeClasses = small ? 'h-5 w-5' : 'h-10 w-10';
  const borderClasses = small ? 'border-2' : 'border-4';

  return (
    <div
      className={`${sizeClasses} ${borderClasses} border-t-amber-500 border-solid rounded-full animate-spin border-gray-700`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
