'use client';

import React, { useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { ClientPortal } from '@/components/portal/ClientPortal';
import { usePortalStore } from '@/lib/portalStore';

export default function ClientPortalPage() {
  const [portalMode, setPortalMode] = useState<'admin' | 'client'>('client');
  const [selectedClientId, setSelectedClientId] = useState<string>('cli-101');
  const { clients } = usePortalStore();

  const currentClient = clients.find((c) => c.id === selectedClientId);

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

      <main className="flex-grow">
        <ClientPortal
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
        />
      </main>
    </div>
  );
}

