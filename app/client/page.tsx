'use client';

import React, { useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { ClientPortal } from '@/components/portal/ClientPortal';
import { usePortalStore } from '@/lib/portalStore';
import Link from 'next/link';
import { ArrowLeft, Construction, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

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

      {/* Under Construction Notice Banner */}
      <div className="bg-amber-100 border-b border-amber-300 text-amber-950 py-2 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#F5A623] text-[#1A1A1A] font-extrabold text-[10px] uppercase inline-flex items-center gap-1 shadow-sm">
              <Construction className="w-3.5 h-3.5" />
              Under Construction
            </span>
            <span>
              <strong>Client Portal Notice:</strong> This digital workspace is exclusively for registered HISK LEGAL clients and is undergoing active enhancements.
            </span>
          </div>
          <a
            href={buildWhatsAppUrl({
              customMessage: 'Assalamu Alaikum HISK LEGAL, I am a client requesting an update on my ongoing case/matter.'
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0A4B35] hover:text-[#0F6B4C] font-extrabold text-xs inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat With Advocate on WhatsApp &rarr;</span>
          </a>
        </div>
      </div>

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
