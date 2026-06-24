'use client';

import React from 'react';
import Link from 'next/link';

export const UpdatesButton: React.FC = () => {
  return (
    <Link 
      href="/updates" 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-200 bg-purple-500/10 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/60 rounded-md transition-all duration-200 cursor-pointer backdrop-blur-sm shadow-sm"
    >
      <span></span>
      <span>Update Logs</span>
    </Link>
  );
};
