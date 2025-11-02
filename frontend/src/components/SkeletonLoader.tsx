import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'list' | 'text' | 'circle';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'card', 
  count = 1,
  className = '' 
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton skeleton-${variant} ${className}`}>
      <div className="skeleton-shimmer"></div>
    </div>
  ));

  return <>{skeletons}</>;
};

export default SkeletonLoader;

