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

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Intersection observer to automatically update active navigation tab based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'calculator', 'about', 'insights', 'reviews'];
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
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] font-sans selection:bg-[#F5A623] selection:text-[#1A1A1A] flex flex-col">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

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

        {/* Tax Calculator Section */}
        <TaxCalculator />

        {/* About Law Firm Section */}
        <AboutSection />

        {/* Tax Insights & Blog Section */}
        <BlogSection />

        {/* Reviews & Testimonials Section */}
        <ReviewsSection />
      </main>

      {/* Sticky Floating WhatsApp Quick Chat Desk */}
      <WhatsAppFloatingButton />

      {/* Footer */}
      <Footer setActiveTab={scrollToSection} />
    </div>
  );
}
