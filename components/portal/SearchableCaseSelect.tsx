'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Briefcase } from 'lucide-react';
import { CaseFile } from '@/types/portal';

interface SearchableCaseSelectProps {
  cases: CaseFile[];
  value: string;
  onChange: (caseId: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const SearchableCaseSelect: React.FC<SearchableCaseSelectProps> = ({
  cases,
  value,
  onChange,
  placeholder = 'Type to search case title, ref, client...',
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCase = cases.find((c) => c.id === value);

  // Filter cases based on search query
  const filteredCases = cases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.caseTitle && c.caseTitle.toLowerCase().includes(q)) ||
      (c.caseRef && c.caseRef.toLowerCase().includes(q)) ||
      (c.clientName && c.clientName.toLowerCase().includes(q)) ||
      (c.clientNtn && c.clientNtn.toLowerCase().includes(q)) ||
      (c.forum && c.forum.toLowerCase().includes(q))
    );
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (c: CaseFile) => {
    onChange(c.id);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <div
          className="w-full bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-200 flex items-center gap-2 cursor-pointer focus-within:border-[#0F6B4C] focus-within:ring-1 focus-within:ring-[#0F6B4C]"
          onClick={() => setIsOpen(true)}
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            required={required && !value}
            value={
              isOpen
                ? searchQuery
                : selectedCase
                ? `[${selectedCase.caseRef}] ${selectedCase.caseTitle} — ${selectedCase.clientName}`
                : searchQuery
            }
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
            }}
            placeholder={
              selectedCase
                ? `[${selectedCase.caseRef}] ${selectedCase.caseTitle}`
                : placeholder
            }
            className="w-full bg-transparent text-xs font-bold text-[#0F6B4C] focus:outline-none placeholder:text-gray-400 placeholder:font-normal cursor-text"
          />
          <ChevronDown
            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-200 shadow-xl max-h-60 overflow-y-auto p-1 divide-y divide-gray-100">
          <div className="p-2 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider flex items-center justify-between bg-gray-50/50 rounded-t-xl">
            <span>Matching Cases ({filteredCases.length})</span>
            <span className="text-[#0F6B4C]">Type to match</span>
          </div>

          {filteredCases.length === 0 ? (
            <div className="p-3 text-xs text-gray-500 text-center font-medium">
              No matching case file found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredCases.map((c) => {
              const isSelected = c.id === value;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#0A4B35]/10 text-[#0A4B35] font-bold'
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-[#0F6B4C]/10 text-[#0F6B4C] font-extrabold text-[10px] px-1.5 py-0.5 rounded">
                        {c.caseRef}
                      </span>
                      <span className="font-extrabold text-gray-900 truncate">
                        {c.caseTitle}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-gray-400 shrink-0" />
                      <span>{c.clientName}</span>
                      {c.clientNtn && (
                        <span className="text-gray-400">(NTN: {c.clientNtn})</span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0F6B4C] shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
