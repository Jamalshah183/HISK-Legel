'use client';

import React from 'react';
import Image from 'next/image';
import { Shield, MessageCircle, Phone, MapPin, Clock, Lock, Mail, Facebook, Linkedin } from 'lucide-react';
import { buildWhatsAppUrl, DISPLAY_PHONE, LAWFIRM_EMAIL, LAWFIRM_ADDRESS, SOCIAL_LINKS } from '@/lib/whatsapp';
import { SERVICES_DATA } from '@/components/ServicesSection';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const handleNavClick = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0A4B35] text-[#FAFAF7] pt-16 pb-12 border-t border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-800/80">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <div className="relative w-44 h-18 sm:w-56 sm:h-24 shrink-0">
                <Image
                  src="https://i.ibb.co/V02sjKtY/file-00000000549882089b03c95577e607a2.png"
                  alt="HISK LEGAL Logo"
                  fill
                  unoptimized
                  className="object-contain object-left"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-md font-normal">
              Specialized High Court tax advocates representing taxpayers before FBR, Appellate Tribunals (ATIR), and High Courts in Pakistan. Direct advocate communication via WhatsApp.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HISK LEGAL Facebook Page"
                className="w-9 h-9 rounded-full bg-emerald-800/80 hover:bg-[#F5A623] hover:text-[#1A1A1A] flex items-center justify-center transition-all text-white"
              >
                <Facebook className="w-4.5 h-4.5" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HISK LEGAL LinkedIn Profile"
                className="w-9 h-9 rounded-full bg-emerald-800/80 hover:bg-[#F5A623] hover:text-[#1A1A1A] flex items-center justify-center transition-all text-white"
              >
                <Linkedin className="w-4.5 h-4.5" />
              </a>
            </div>

            <div className="pt-2">
              <a
                href={buildWhatsAppUrl({ topic: 'general' })}
                target="_blank"
                rel="noopener noreferrer"
                id="footer-whatsapp-btn"
                className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-heading font-extrabold text-xs py-3 px-5 rounded-xl shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-[#1A1A1A]" />
                <span>Talk to an Expert on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="font-heading font-extrabold text-sm text-[#F5A623] uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100">
              {[
                { id: 'home', label: 'Home' },
                { id: 'services', label: 'Services' },
                { id: 'calculator', label: 'FBR Tax Calculator' },
                { id: 'about', label: 'About HISK LEGAL' },
                { id: 'insights', label: 'Tax Briefings' },
                { id: 'reviews', label: 'Client Reviews' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className="hover:text-[#F5A623] transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice Areas */}
          <div>
            <h4 className="font-heading font-extrabold text-sm text-[#F5A623] uppercase tracking-wider mb-4">
              Practices
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-100">
              {SERVICES_DATA.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <a
                    href={buildWhatsAppUrl({ topic: 'practice_area', practiceArea: s.title })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F5A623] transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-extrabold text-sm text-[#F5A623] uppercase tracking-wider mb-4">
              Contact & Offices
            </h4>
            <div className="space-y-3 text-xs text-emerald-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                <span>{LAWFIRM_ADDRESS}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F5A623] shrink-0" />
                <a
                  href={buildWhatsAppUrl({ topic: 'general' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F5A623] transition-colors"
                >
                  {DISPLAY_PHONE}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F5A623] shrink-0" />
                <a
                  href={`mailto:${LAWFIRM_EMAIL}`}
                  className="hover:text-[#F5A623] transition-colors"
                >
                  {LAWFIRM_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F5A623] shrink-0" />
                <span>WhatsApp Advocate Desk Active 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <Lock className="w-4 h-4 text-[#F5A623] shrink-0" />
                <span>Advocate Privilege Applies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-8 text-[11px] text-emerald-200/60 leading-relaxed flex flex-col md:flex-row justify-between gap-4">
          <p className="max-w-4xl">
            <strong>Advocate Advertising Disclaimer:</strong> Information on this website is for general guidance on Pakistani tax law. Communication through WhatsApp does not form a legal practitioner-client relationship until a formal Vakalatnama or retainer is signed.
          </p>
          <p className="shrink-0 text-emerald-100 font-semibold">
            &copy; {new Date().getFullYear()} HISK LEGAL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
