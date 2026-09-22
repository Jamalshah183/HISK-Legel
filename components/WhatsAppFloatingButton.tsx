'use client';

import React, { useState } from 'react';
import { MessageCircle, X, ShieldAlert, Building, BadgeCheck, ChevronRight } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const topics = [
    {
      id: 'fbr_audit',
      title: 'Received FBR Notice / Audit',
      subtitle: 'Show cause notice & High Court stay',
      icon: <ShieldAlert className="w-4 h-4 text-red-500" />
    },
    {
      id: 'general',
      customMessage: 'Assalamu Alaikum HISK LEGAL, I need assistance with Active Taxpayer List (ATL) registration and NTN return filing.',
      title: 'Active Taxpayer List (ATL)',
      subtitle: 'NTN filing & non-filer status removal',
      icon: <BadgeCheck className="w-4 h-4 text-[#F5A623]" />
    },
    {
      id: 'business_tax',
      title: 'Corporate & IT Export Tax',
      subtitle: 'SECP Company & Sec 154A IT tax',
      icon: <Building className="w-4 h-4 text-[#0F6B4C]" />
    },
    {
      id: 'general',
      title: 'Talk to High Court Advocate',
      subtitle: 'Direct WhatsApp chat with Advocate',
      icon: <MessageCircle className="w-4 h-4 text-[#25D366]" />
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-3xl p-5 shadow-2xl border border-[#0F6B4C]/20">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
              </span>
              <div>
                <h4 className="font-heading font-extrabold text-sm text-[#1A1A1A]">
                  HISK LEGAL Advocate Desk
                </h4>
                <p className="text-[10px] text-[#5A6275]">High Court Tax Advocates</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
              id="close-floating-whatsapp-popover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {topics.map((t) => (
              <a
                key={t.title}
                href={buildWhatsAppUrl({ topic: t.id as any, customMessage: (t as any).customMessage })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#E8F5F0] transition-colors border border-gray-100 group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-white shrink-0">
                    {t.icon}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#1A1A1A] group-hover:text-[#0F6B4C]">
                      {t.title}
                    </div>
                    <div className="text-[10px] text-[#5A6275]">{t.subtitle}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0F6B4C] shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-xl transition-all transform hover:scale-105 flex items-center justify-center group"
        aria-label="WhatsApp Advocate Chat"
        id="floating-whatsapp-main-trigger"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
      </button>
    </div>
  );
};
