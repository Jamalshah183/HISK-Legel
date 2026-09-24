'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Shield, MessageCircle, Menu, X, Phone, ChevronRight, AlertTriangle, Scale, HelpCircle } from 'lucide-react';
import { buildWhatsAppUrl, DISPLAY_PHONE } from '@/lib/whatsapp';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPortal?: (mode?: 'admin' | 'client') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenPortal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About Firm' },
    { id: 'insights', label: 'Legal Insights' },
    { id: 'reviews', label: 'Reviews' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Banner (Hidden on mobile) */}
      <div className="hidden sm:block bg-[#0A4B35] text-white text-[11px] py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-2">
          <a
            href={buildWhatsAppUrl({ customMessage: 'Assalamu Alaikum HISK LEGAL, I need emergency legal help.' })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-medium shrink-0 hover:text-[#F5A623] transition-colors cursor-pointer group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
            </span>
            <span className="font-bold group-hover:underline">Emergency Legal Help - Chat Now</span>
          </a>
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-3 gap-y-1 text-[11px]">
            <a
              href={buildWhatsAppUrl({ topic: 'fbr_audit' })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5A623] hover:underline font-bold flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" /> FBR Notice Received? Chat Now
            </a>
            <span className="text-emerald-300/40">|</span>
            <a
              href={buildWhatsAppUrl({ customMessage: 'Assalamu Alaikum HISK LEGAL, an FIR has been registered and I need urgent criminal law & bail legal assistance.' })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5A623] hover:underline font-bold flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> FIR Registered? Chat Now
            </a>
            <span className="text-emerald-300/40">|</span>
            <a
              href={buildWhatsAppUrl({ customMessage: 'Assalamu Alaikum HISK LEGAL, a civil case has been filed and I need advocate representation.' })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5A623] hover:underline font-bold flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" /> Civil Case Filed? Chat Now
            </a>
            <span className="text-emerald-300/40">|</span>
            <a
              href={buildWhatsAppUrl({ topic: 'general', customMessage: 'Assalamu Alaikum HISK LEGAL, I require a legal consultation for my legal matter.' })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline font-bold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Legal Consultation Required? Chat Now
            </a>
            <span className="text-emerald-300/40">|</span>
            <a
              href={buildWhatsAppUrl({ topic: 'general' })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> {DISPLAY_PHONE}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAFAF7]/95 backdrop-blur-md shadow-sm border-b border-[#0F6B4C]/10 py-1 sm:py-2.5'
            : 'bg-[#FAFAF7] border-b border-[#0F6B4C]/10 py-1.5 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center text-left focus:outline-none cursor-pointer group"
            id="nav-logo-btn"
          >
            <div
              className={`relative shrink-0 transition-all duration-300 ${
                isScrolled
                  ? 'h-[66px] w-[72px] sm:h-[78px] sm:w-[84px] md:h-[86px] md:w-[92px] lg:h-[94px] lg:w-[102px]'
                  : 'h-[80px] w-[86px] sm:h-[96px] sm:w-[104px] md:h-[108px] md:w-[116px] lg:h-[120px] lg:w-[130px]'
              }`}
            >
              <Image
                src="https://i.ibb.co/8Lh2Hzsq/Whats-App-Image-2026-09-17-at-7-22-55-PM.jpg"
                alt="HISK LEGAL Logo"
                fill
                unoptimized
                priority
                className="object-contain object-left mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </button>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-link-${item.id}`}
                  className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'text-[#0F6B4C] bg-[#0F6B4C]/10'
                      : 'text-[#1A1A1A] hover:text-[#0F6B4C] hover:bg-[#0F6B4C]/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Action */}
          <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
            {onOpenPortal && (
              <>
                <button
                  onClick={() => onOpenPortal('admin')}
                  id="navbar-admin-portal-cta"
                  className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-heading font-extrabold px-3.5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 text-xs sm:text-sm border border-emerald-500/30 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#F5A623]" />
                  <span>Admin Portal</span>
                </button>

                <button
                  onClick={() => onOpenPortal('client')}
                  id="navbar-client-portal-cta"
                  className="bg-[#0F6B4C] hover:bg-[#0A4B35] text-white font-heading font-extrabold px-3.5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 text-xs sm:text-sm border border-emerald-400/20 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#F5A623]" />
                  <span>Client Portal</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#0F6B4C] hover:bg-[#0F6B4C]/10 transition-colors"
              aria-label="Toggle menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAFAF7] border-b border-[#0F6B4C]/10 px-4 pt-3 pb-6 shadow-xl">
            <div className="flex flex-col space-y-2 pt-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`mobile-nav-link-${item.id}`}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left text-base font-bold ${
                    activeTab === item.id
                      ? 'bg-[#0F6B4C] text-[#FAFAF7]'
                      : 'text-[#1A1A1A] hover:bg-[#0F6B4C]/10'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              ))}

              <div className="pt-4 border-t border-[#0F6B4C]/10 space-y-2">
                {onOpenPortal && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenPortal('admin');
                      }}
                      className="bg-[#0A4B35] text-white font-extrabold py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs shadow-md border border-emerald-500/30"
                    >
                      <Shield className="w-4 h-4 text-[#F5A623]" />
                      <span>Admin Desk</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenPortal('client');
                      }}
                      className="bg-[#0F6B4C] text-white font-extrabold py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs shadow-md"
                    >
                      <Shield className="w-4 h-4 text-[#F5A623]" />
                      <span>Client Portal</span>
                    </button>
                  </div>
                )}
                <a
                  href={buildWhatsAppUrl({ topic: 'general' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#F5A623] text-[#1A1A1A] font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <MessageCircle className="w-5 h-5 fill-[#1A1A1A]" />
                  <span>Talk to an Expert on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
