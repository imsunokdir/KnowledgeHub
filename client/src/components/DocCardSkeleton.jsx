import React from "react";

const DocCardSkeleton = () => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 animate-pulse">
      {/* Document Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-slate-200 rounded w-2/3"></div>
        <div className="h-5 bg-slate-200 rounded w-12"></div>
      </div>

      {/* Document Content Preview */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-11/12"></div>
        <div className="h-4 bg-slate-200 rounded w-10/12"></div>
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        {/* AI Status */}
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <div className="h-5 bg-slate-200 rounded-full w-12"></div>
          <div className="h-5 bg-slate-200 rounded-full w-16"></div>
          <div className="h-5 bg-slate-200 rounded-full w-10"></div>
        </div>

        {/* Author + Date */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-slate-200 rounded w-16"></div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
      </div>

      {/* View Button */}
      <div className="flex justify-end mt-3">
        <div className="h-4 bg-slate-200 rounded w-14"></div>
      </div>
    </div>
  );
};

export default DocCardSkeleton;
