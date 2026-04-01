import React from 'react';

export const StatsCardSkeleton = () => (
  <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-card p-6 animate-pulse">
    <div className="rounded-full p-3 bg-gray-200 w-12 h-12" />
    <div>
      <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-16 bg-gray-100 rounded" />
    </div>
  </div>
);
