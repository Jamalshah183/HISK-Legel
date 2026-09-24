'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, MapPin, Lock, Mail, Facebook, Linkedin } from 'lucide-react';
import { buildWhatsAppUrl, DISPLAY_PHONE, LAWFIRM_EMAIL, LAWFIRM_ADDRESS, SOCIAL_LINKS } from '@/lib/whatsapp';
import { SERVICES_DATA } from '@/components/ServicesSection';

interface FooterProps {
  setActiveTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const handleNavClick = (id: string) => {
    if (setActiveTab) {
      setActiveTab(id);
    }
    if (id === 'home') {
      if (window.location.pathname !== '/') {
        window.location.assign('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    } else {
      window.location.assign(`/#${id}`);
    }
  };

  return (
    <footer className="bg-[#0A4B35] text-[#FAFAF7] py-8 sm:py-10 border-t border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-8 border-b border-emerald-800/80">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            {/* Brand Logos with clean subtle spacing */}
            <div className="flex items-center">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white rounded-lg sm:rounded-xl p-1 sm:p-1.5 shadow-sm border border-white/20">
                {/* Original Firm Logo (Trimmed to fit without negative margins) */}
                <div className="relative h-14 w-[117px] sm:h-16 sm:w-[134px] lg:h-18 lg:w-[150px] shrink-0">
                  <Image
                    src="/images/logo-trimmed.jpg"
                    alt="HISK LEGAL Logo"
                    fill
                    unoptimized
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Secondary Logo Adjacent */}
                <div className="relative h-14 w-[67px] sm:h-16 sm:w-[76px] lg:h-18 lg:w-[86px] shrink-0">
                  <Image
                    src="/images/logo-secondary-trimmed.jpg"
                    alt="Affiliated Legal Authority Logo"
                    fill
                    unoptimized
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-emerald-100/90 leading-relaxed max-w-md font-normal">
              HISK LEGAL is a premier law firm in Pakistan led by Hafiz Irfan Shabber Kayani, Advocate High Court, Founder &amp; CEO. With over two decades of advocacy experience, the firm provides strategic legal counsel, decisive litigation, and practical solutions across tax, corporate, commercial, civil, and criminal matters.
            </p>

            <div className="flex items-center gap-3">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HISK LEGAL Facebook Page"
                className="w-8 h-8 rounded-full bg-emerald-800/80 hover:bg-[#F5A623] hover:text-[#1A1A1A] flex items-center justify-center transition-all text-white"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HISK LEGAL LinkedIn Profile"
                className="w-8 h-8 rounded-full bg-emerald-800/80 hover:bg-[#F5A623] hover:text-[#1A1A1A] flex items-center justify-center transition-all text-white"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="font-heading font-extrabold text-sm text-[#F5A623] uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-emerald-100">
              {[
                { id: 'home', label: 'Home' },
                { id: 'services', label: 'Services' },
                { id: 'about', label: 'About HISK LEGAL' },
                { id: 'insights', label: 'Legal Insights & Blog' },
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
            <h4 className="font-heading font-extrabold text-sm text-[#F5A623] uppercase tracking-wider mb-3">
              Practices
            </h4>
            <ul className="space-y-2 text-sm text-emerald-100">
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
            <h4 className="font-heading font-extrabold text-sm text-[#F5A623] uppercase tracking-wider mb-3">
              Contact & Offices
            </h4>
            <div className="space-y-2.5 text-sm text-emerald-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                <span className="leading-snug">{LAWFIRM_ADDRESS}</span>
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
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <Lock className="w-4 h-4 text-[#F5A623] shrink-0" />
                <span>Advocate Privilege Applies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="pt-4 text-xs text-emerald-200/70 leading-normal flex flex-col md:flex-row justify-between items-center gap-2 border-t border-emerald-800/60 mt-1">
          <p className="text-emerald-100 font-semibold">
            &copy; {new Date().getFullYear()} HISK LEGAL. All rights reserved.
          </p>
          <div className="text-emerald-200/80 text-xs">
            High Court Advocates &amp; Tax Practitioners • Islamabad, Pakistan
          </div>
        </div>
      </div>
    </footer>
  );
};
