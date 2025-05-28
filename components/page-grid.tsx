'use client';

import { Page404 } from '@/lib/actions';
import { PageTile } from '@/components/page-tile';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PageGridProps {
  pages: Page404[];
}

export function PageGrid({ pages }: PageGridProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    // Add a small delay to show the loading state
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-muted-foreground">
            No 404 pages yet
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Enter a prompt above to create your first custom 404 page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your 404 Pages</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page, index) => (
          <PageTile key={index} page={page} />
        ))}
      </div>
    </div>
  );
}