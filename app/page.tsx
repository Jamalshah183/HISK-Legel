'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ServicesSection } from '@/components/ServicesSection';
import { TaxCalculator } from '@/components/TaxCalculator';
import { AboutSection } from '@/components/AboutSection';
import { BlogSection } from '@/components/BlogSection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { Footer } from '@/components/Footer';

// Case Management Portal Components
import { PortalHeader } from '@/components/portal/PortalHeader';
import { AdminPortal } from '@/components/portal/AdminPortal';
import { ClientPortal } from '@/components/portal/ClientPortal';
import { usePortalStore } from '@/lib/portalStore';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Case Portal View State
  const [isPortalOpen, setIsPortalOpen] = useState<boolean>(false);
  const [portalMode, setPortalMode] = useState<'admin' | 'client'>('admin');
  const [selectedClientId, setSelectedClientId] = useState<string>('cli-101');

  const { clients } = usePortalStore();
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Intersection observer to automatically update active navigation tab based on scroll
  useEffect(() => {
    if (isPortalOpen) return;

    const handleScroll = () => {
      const sections = ['home', 'services', 'about', 'insights', 'reviews', 'calculator'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPortalOpen]);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
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

  const handleOpenPortal = (mode: 'admin' | 'client' = 'admin') => {
    setPortalMode(mode);
    setIsPortalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // IF PORTAL MODE IS ACTIVE, SHOW THE CASE MANAGEMENT SYSTEM
  if (isPortalOpen) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] font-sans selection:bg-[#F5A623] selection:text-[#1A1A1A] flex flex-col">
        <PortalHeader
          mode={portalMode}
          setMode={setPortalMode}
          onExitPortal={() => setIsPortalOpen(false)}
          selectedClientName={currentClient?.name}
          onClientSelectClick={() => setPortalMode('client')}
        />

        {portalMode === 'admin' ? (
          <AdminPortal />
        ) : (
          <ClientPortal
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
          />
        )}
      </div>
    );
  }

  // PUBLIC WEBSITE VIEW
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] font-sans selection:bg-[#F5A623] selection:text-[#1A1A1A] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPortal={handleOpenPortal}
      />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <div id="home">
          <Hero
            onNavigateToCalc={() => scrollToSection('calculator')}
            onNavigateToPractice={() => scrollToSection('services')}
          />
        </div>

        {/* Services Section */}
        <ServicesSection />

        {/* About Law Firm Section */}
        <AboutSection />

        {/* Tax Insights & Blog Section */}
        <BlogSection />

        {/* Reviews & Testimonials Section */}
        <ReviewsSection />

        {/* Tax Calculator Section */}
        <TaxCalculator />
      </main>

      {/* Sticky Floating WhatsApp Quick Chat Desk */}
      <WhatsAppFloatingButton />

      {/* Footer */}
      <Footer setActiveTab={scrollToSection} />
    </div>
  );
}
