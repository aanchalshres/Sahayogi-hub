import React from 'react';

export const ActivitySkeleton = () => (
  <div className="mb-8 ml-6 animate-pulse">
    <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full -left-3 ring-8 ring-white" />
    <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
    <div className="h-3 w-24 bg-gray-100 rounded" />
  </div>
);
