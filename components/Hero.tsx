'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Users, 
  CheckCircle2, 
  Scale, 
  MapPin
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { FIRM_METRICS } from '@/data/lawFirmData';
import { HERO_CITY_VIDEOS, CityVideo } from '@/data/heroVideos';

interface HeroProps {
  onNavigateToPractice?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToPractice }) => {
  const [currentCityIndex, setCurrentCityIndex] = useState<number>(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const activeCity: CityVideo = HERO_CITY_VIDEOS[currentCityIndex];

  const whatsappUrl = buildWhatsAppUrl({
    customMessage: 'Assalamu Alaikum HISK LEGAL, I would like to book a free tax consultation with a High Court Advocate regarding my FBR tax matter.'
  });

  // Auto-switch city videos automatically every 5 seconds (5000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCityIndex((prevIndex) => (prevIndex + 1) % HERO_CITY_VIDEOS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Programmatically enforce muted autoplay on active video whenever city changes
  useEffect(() => {
    const activeVid = videoRefs.current[currentCityIndex];
    if (activeVid) {
      activeVid.defaultMuted = true;
      activeVid.muted = true;
      activeVid.playsInline = true;
      activeVid.currentTime = 0;
      const playPromise = activeVid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser autoplay handling
        });
      }
    }
  }, [currentCityIndex]);

  return (
    <motion.section
      id="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="scroll-mt-24 relative overflow-hidden min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-between pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 bg-[#061A13] text-white"
    >
      {/* Background Video Layer with Smooth Transitions */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        
        {/* Instant Fallback / City Poster Image Backdrop */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ backgroundImage: `url(${activeCity.posterUrl})` }}
        />

        {/* Dynamic City Image/Video Crossfade with Seamless Autoplay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCity.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0 w-full h-full"
          >
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center transform scale-105 transition-all duration-1000"
              style={{ backgroundImage: `url(${activeCity.posterUrl})` }}
            />
            {activeCity.videoUrl && (
              <video
                ref={(el) => {
                  videoRefs.current[currentCityIndex] = el;
                  if (el) {
                    el.defaultMuted = true;
                    el.muted = true;
                    el.playsInline = true;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster={activeCity.posterUrl}
                src={activeCity.videoUrl}
                onCanPlay={(e) => {
                  e.currentTarget.muted = true;
                  e.currentTarget.play().catch(() => {});
                }}
                onLoadedData={(e) => {
                  e.currentTarget.muted = true;
                  e.currentTarget.play().catch(() => {});
                }}
                className="absolute inset-0 w-full h-full object-cover scale-105 opacity-90 transition-opacity duration-1000"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Luminous Gradient Overlay - Calibrated to keep video crystal-clear while text is 100% legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061A13]/70 via-[#061A13]/30 to-[#061A13]/85" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#061A13]/30 to-[#061A13]/70" />
      </div>

      {/* Atmospheric Ambient Glows (Positioned subtly at edges so they don't obscure video) */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 sm:w-[500px] sm:h-[500px] rounded-full bg-[#0F6B4C]/25 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-[500px] sm:h-[500px] rounded-full bg-[#F5A623]/15 blur-3xl pointer-events-none z-0" />

      {/* Active City Floating Pill Indicator (Minimalist, No Click Selector) */}
      <div className="absolute top-20 right-4 sm:right-8 z-20 pointer-events-none">
        <motion.div
          key={activeCity.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-[#061A13]/85 backdrop-blur-md border border-[#0F6B4C]/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200 shadow-xl flex items-center gap-2"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]"></span>
          </span>
          <span>{activeCity.flagEmoji}</span>
          <span className="text-white font-bold">{activeCity.cityName}</span>
          <span className="text-[#F5A623] text-[10px] hidden sm:inline">• {activeCity.landmark}</span>
          <span className="text-emerald-300/80 text-[10px] hidden md:inline">({activeCity.regionTag})</span>
        </motion.div>
      </div>

      {/* Main Hero Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center space-y-5 sm:space-y-7 my-auto">
        
        {/* Minimalist Trust Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center w-full"
        >
          <div className="inline-flex items-center gap-2 bg-[#0F6B4C]/70 backdrop-blur-md border border-[#0F6B4C] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#F5A623] shadow-lg">
            <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
            <span>Trusted Advocacy Solutions Exceeding Expectations</span>
          </div>
        </motion.div>

        {/* Outcome-Focused Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl lg:leading-[1.18] text-white tracking-tight max-w-4xl text-center drop-shadow-lg"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFD07B] to-[#F5A623]">Strategic Legal Representation</span>{' '}
          For Individuals, Businesses &amp; Corporate Clients{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFD07B] to-[#F5A623]">Across All Major Cities of Pakistan</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm sm:text-base lg:text-lg text-[#C2D8D0] font-normal leading-relaxed max-w-3xl text-center drop-shadow-md"
        >
          <strong className="font-semibold text-white">20+ Years of Legal Excellence</strong> — Trusted advocates with over two decades of experience in civil, criminal, family, rent, corporate and tax litigation, successfully safeguarding the interests of 5,000+ businesses and high-net-worth clients under one roof.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="hero-primary-cta"
            className="w-full sm:w-auto bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-heading font-extrabold text-base sm:text-lg px-7 py-3.5 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2.5 text-center"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-[#1A1A1A]" />
            <span>Book Free Consultation</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

          {onNavigateToPractice && (
            <button
              onClick={onNavigateToPractice}
              type="button"
              className="w-full sm:w-auto bg-[#0F6B4C]/60 hover:bg-[#0F6B4C]/90 backdrop-blur-md text-white border border-[#0F6B4C]/80 hover:border-[#F5A623]/60 font-heading font-bold text-base px-6 py-3.5 rounded-xl sm:rounded-2xl transition-all inline-flex items-center justify-center gap-2 shadow-lg"
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
          className="mt-2 pt-3 sm:pt-4 w-full max-w-4xl bg-[#0A4B35]/75 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#0F6B4C]/70 shadow-2xl grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-emerald-100 font-medium"
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
