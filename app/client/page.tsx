'use client';

import React, { useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { ClientPortal } from '@/components/portal/ClientPortal';
import { usePortalStore } from '@/lib/portalStore';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ClientPortalPage() {
  const [portalMode, setPortalMode] = useState<'admin' | 'client'>('client');
  const [selectedClientId, setSelectedClientId] = useState<string>('cli-101');
  const { clients } = usePortalStore();

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#F5A623] selection:text-[#1A1A1A]">
      <PortalHeader
        mode={portalMode}
        setMode={setPortalMode}
        onExitPortal={() => {
          window.location.href = '/';
        }}
        selectedClientName={currentClient?.name}
      />

      <div className="bg-[#0A4B35] text-white py-1.5 px-4 text-xs font-semibold flex items-center justify-between border-b border-[#0F6B4C]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="text-emerald-200 hover:text-white flex items-center gap-1.5 font-heading">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main Law Firm Website
          </Link>
          <span className="text-emerald-300 hidden sm:inline">
            Direct Client Portal URL: <code className="bg-emerald-950 px-2 py-0.5 rounded text-[#F5A623]">/client</code>
          </span>
        </div>
      </div>

      <main className="flex-grow">
        <ClientPortal
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
        />
      </main>
    </div>
  );
}
