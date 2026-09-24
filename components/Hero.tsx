'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, ArrowRight, ShieldCheck, Award, Users, CheckCircle2, Scale } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { FIRM_METRICS } from '@/data/lawFirmData';

interface HeroProps {
  onNavigateToPractice?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToPractice }) => {
  const whatsappUrl = buildWhatsAppUrl({
    customMessage: 'Assalamu Alaikum HISK LEGAL, I would like to book a free tax consultation with a High Court Advocate regarding my FBR tax matter.'
  });

  return (
    <motion.section
      id="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="scroll-mt-24 relative overflow-hidden min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20 bg-[#0F3E2E] text-white"
    >
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 opacity-90"
        >
          <source src="https://www.pexels.com/download/video/16555149/" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Lightened Luminous Gradient Overlay (Decreased Darkness) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061A13]/55 via-[#0A4B35]/35 to-[#061A13]/60" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 sm:w-[550px] sm:h-[550px] rounded-full bg-[#0F6B4C]/50 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-[550px] sm:h-[550px] rounded-full bg-[#F5A623]/30 blur-3xl pointer-events-none z-0" />

      {/* Main Hero Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center space-y-6 sm:space-y-8">
        
        {/* Minimalist Trust Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center w-full"
        >
          <div className="inline-flex items-center gap-2 bg-[#0F6B4C]/50 backdrop-blur-md border border-[#0F6B4C] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#F5A623] shadow-lg">
            <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
            <span>Trusted Advocacy Solutions Exceeding Expectations</span>
          </div>
        </motion.div>

        {/* Outcome-Focused Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl lg:leading-[1.18] text-white tracking-tight max-w-4xl text-center drop-shadow-md"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFD07B] to-[#F5A623]">Strategic Legal Representation</span>{' '}
          For Individuals, Businesses &amp; Corporate Clients{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFD07B] to-[#F5A623]">Across Pakistan &amp; Beyond</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm sm:text-base lg:text-lg text-[#C2D8D0] font-normal leading-relaxed max-w-3xl text-center drop-shadow-sm"
        >
          <strong className="font-semibold text-white">20+ Years of Legal Excellence</strong> — Trusted advocates with over two decades of experience in civil, criminal, family, rent, corporate and tax litigation, successfully safeguarding the interests of 5,000+ businesses and high-net-worth clients under one roof.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="hero-primary-cta"
            className="w-full sm:w-auto bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-heading font-extrabold text-base sm:text-lg px-7 py-4 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2.5 text-center"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-[#1A1A1A]" />
            <span>Book Free Consultation</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

          {onNavigateToPractice && (
            <button
              onClick={onNavigateToPractice}
              type="button"
              className="w-full sm:w-auto bg-[#0F6B4C]/40 hover:bg-[#0F6B4C]/70 backdrop-blur-md text-white border border-[#0F6B4C]/70 hover:border-[#F5A623]/60 font-heading font-bold text-base px-6 py-4 rounded-xl sm:rounded-2xl transition-all inline-flex items-center justify-center gap-2"
            >
              <Scale className="w-5 h-5 text-[#F5A623]" />
              <span>Explore Practice Areas</span>
            </button>
          )}
        </motion.div>

        {/* Glassmorphic Metrics / Trust-Signal Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 pt-4 sm:pt-6 w-full max-w-4xl bg-[#0A4B35]/60 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 md:p-5 border border-[#0F6B4C]/60 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6 text-xs sm:text-sm text-emerald-100 font-medium"
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1 whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-[#F5A623] shrink-0" />
            <span className="whitespace-nowrap">
              <strong className="text-white font-extrabold text-xs sm:text-sm md:text-base">{FIRM_METRICS.successfulCases}</strong> Successful Court Cases
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1 border-t sm:border-t-0 sm:border-l border-[#0F6B4C]/40 whitespace-nowrap">
            <Users className="w-4 h-4 text-[#F5A623] shrink-0" />
            <span className="whitespace-nowrap">
              <strong className="text-white font-extrabold text-xs sm:text-sm md:text-base">{FIRM_METRICS.clientsServed}</strong> Clients Served
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1 border-t sm:border-t-0 sm:border-l border-[#0F6B4C]/40 whitespace-nowrap">
            <Award className="w-4 h-4 text-[#F5A623] shrink-0" />
            <span className="whitespace-nowrap">
              <strong className="text-white font-extrabold text-xs sm:text-sm md:text-base">{FIRM_METRICS.totalTaxSaved}</strong> Tax Saved
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};


