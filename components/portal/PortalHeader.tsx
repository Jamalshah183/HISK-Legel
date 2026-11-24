'use client';

import React from 'react';
import {
  ArrowLeft,
  Search
} from 'lucide-react';

interface PortalHeaderProps {
  mode: 'admin' | 'client';
  setMode: (mode: 'admin' | 'client') => void;
  onExitPortal: () => void;
  selectedClientName?: string;
  onClientSelectClick?: () => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  unreadCount?: number;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  mode,
  onExitPortal,
  selectedClientName,
  searchTerm = '',
  setSearchTerm
}) => {
  return (
    <header className="bg-[#0A4B35] text-white sticky top-0 z-50 border-b border-[#0F6B4C] h-14 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Zone 1: Back Action + Wordmark */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onExitPortal}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 min-h-[40px] rounded-lg transition-colors shrink-0 cursor-pointer whitespace-nowrap"
            title="Back to Public Law Firm Website"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Back to Website</span>
            <span className="sm:hidden">Website</span>
          </button>

          <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-white whitespace-nowrap shrink-0">
            HISK LEGAL
          </span>
        </div>

        {/* Zone 2: Optional Search Bar (Admin) or Portal Context */}
        {setSearchTerm ? (
          <div className="hidden md:flex items-center relative flex-1 max-w-md mx-4">
            <Search className="w-4 h-4 text-emerald-200 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cases, NTN, clients, FBR notices..."
              className="w-full bg-[#0F6B4C]/60 text-white placeholder-emerald-200/70 text-xs rounded-xl pl-9 pr-4 py-2 border border-emerald-500/30 focus:outline-none focus:border-[#F5A623] transition-all"
            />
          </div>
        ) : (
          <span className="hidden md:inline text-xs font-medium text-emerald-200/90 truncate max-w-xs">
            {mode === 'admin' ? 'Advocates Case Management' : selectedClientName ? `Client Workspace · ${selectedClientName}` : 'Client Case Portal'}
          </span>
        )}

        {/* Zone 3: Compact Mode Label */}
        <span className="text-xs font-semibold text-[#F5A623] whitespace-nowrap shrink-0">
          {mode === 'admin' ? 'Admin Desk' : 'Client Portal'}
        </span>
      </div>
    </header>
  );
};
