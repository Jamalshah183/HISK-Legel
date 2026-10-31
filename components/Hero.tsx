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
  Globe, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
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
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeCity: CityVideo = HERO_CITY_VIDEOS[currentCityIndex];

  const whatsappUrl = buildWhatsAppUrl({
    customMessage: 'Assalamu Alaikum HISK LEGAL, I would like to book a free tax consultation with a High Court Advocate regarding my FBR tax matter.'
  });

  // Auto-cycle city videos every 9 seconds if autoPlay is enabled
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentCityIndex((prevIndex) => (prevIndex + 1) % HERO_CITY_VIDEOS.length);
      setVideoError(false);
    }, 9000);

    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const handleSelectCity = (index: number) => {
    setCurrentCityIndex(index);
    setVideoError(false);
  };

  const handlePrevCity = () => {
    setCurrentCityIndex((prev) => (prev - 1 + HERO_CITY_VIDEOS.length) % HERO_CITY_VIDEOS.length);
    setVideoError(false);
  };

  const handleNextCity = () => {
    setCurrentCityIndex((prev) => (prev + 1) % HERO_CITY_VIDEOS.length);
    setVideoError(false);
  };

  return (
    <motion.section
      id="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="scroll-mt-24 relative overflow-hidden min-h-[88vh] sm:min-h-[92vh] flex flex-col items-center justify-between pt-16 sm:pt-20 lg:pt-22 pb-10 sm:pb-14 lg:pb-16 bg-[#0F3E2E] text-white"
    >
      {/* Background Video Layer with Smooth Transitions */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCity.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover scale-105 opacity-85 transition-opacity duration-1000"
            >
              <source 
                src={videoError && activeCity.fallbackUrl ? activeCity.fallbackUrl : activeCity.videoUrl} 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
          </motion.div>
        </AnimatePresence>

        {/* Luminous Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061A13]/65 via-[#0A4B35]/40 to-[#061A13]/75" />
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 sm:w-[550px] sm:h-[550px] rounded-full bg-[#0F6B4C]/50 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-[550px] sm:h-[550px] rounded-full bg-[#F5A623]/30 blur-3xl pointer-events-none z-0" />

      {/* Main Hero Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center space-y-5 sm:space-y-7 my-auto">
        
        {/* Minimalist Trust Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center w-full"
        >
          <div className="inline-flex items-center gap-2 bg-[#0F6B4C]/60 backdrop-blur-md border border-[#0F6B4C] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#F5A623] shadow-lg">
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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFD07B] to-[#F5A623]">Across All Major Cities of Pakistan</span>
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
              className="w-full sm:w-auto bg-[#0F6B4C]/50 hover:bg-[#0F6B4C]/80 backdrop-blur-md text-white border border-[#0F6B4C]/70 hover:border-[#F5A623]/60 font-heading font-bold text-base px-6 py-3.5 rounded-xl sm:rounded-2xl transition-all inline-flex items-center justify-center gap-2"
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
          className="mt-2 pt-3 sm:pt-4 w-full max-w-4xl bg-[#0A4B35]/60 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#0F6B4C]/60 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-emerald-100 font-medium"
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

      {/* Major Cities of Pakistan Hero Video Switcher Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-10 mt-6"
      >
        <div className="bg-[#061A13]/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#0F6B4C]/70 shadow-2xl flex flex-col gap-3">
          
          {/* Header Row with Active City Info & Play/Pause Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0F6B4C]/40 pb-2.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-200">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0F6B4C]/70 text-[#F5A623] border border-[#0F6B4C]">
                <Globe className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="text-[#F5A623] font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                  Major Cities of Pakistan:
                </span>
                <span className="text-white font-bold inline-flex items-center gap-1.5 bg-[#0F6B4C]/50 px-2.5 py-0.5 rounded-md border border-[#0F6B4C]/60 text-xs sm:text-sm">
                  <span>{activeCity.flagEmoji}</span>
                  <span>{activeCity.cityName}, {activeCity.country}</span>
                  <span className="text-[#F5A623] text-[10px] font-normal hidden md:inline">({activeCity.regionTag})</span>
                </span>
              </div>
            </div>

            {/* Play/Pause & Arrow Navigation Controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handlePrevCity}
                type="button"
                title="Previous City Video"
                className="p-1.5 rounded-lg bg-[#0F6B4C]/40 hover:bg-[#0F6B4C] text-emerald-200 hover:text-white transition-all border border-[#0F6B4C]/60"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                type="button"
                title={isAutoPlay ? 'Pause Auto-Rotating Videos' : 'Auto-Rotate City Videos'}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  isAutoPlay
                    ? 'bg-[#F5A623]/20 border-[#F5A623]/60 text-[#F5A623]'
                    : 'bg-[#0F6B4C]/40 border-[#0F6B4C]/60 text-emerald-200 hover:text-white'
                }`}
              >
                {isAutoPlay ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Auto-Rotate ON</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Auto-Rotate OFF</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextCity}
                type="button"
                title="Next City Video"
                className="p-1.5 rounded-lg bg-[#0F6B4C]/40 hover:bg-[#0F6B4C] text-emerald-200 hover:text-white transition-all border border-[#0F6B4C]/60"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable City Selection Tabs / Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#0F6B4C] scrollbar-track-transparent">
            {HERO_CITY_VIDEOS.map((city, idx) => {
              const isActive = idx === currentCityIndex;
              return (
                <button
                  key={city.id}
                  onClick={() => handleSelectCity(idx)}
                  type="button"
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F5A623] to-[#E09415] text-[#1A1A1A] font-bold border-[#F5A623] shadow-lg scale-105'
                      : 'bg-[#0A4B35]/50 hover:bg-[#0F6B4C]/60 text-emerald-100 border-[#0F6B4C]/50 hover:border-[#F5A623]/40'
                  }`}
                >
                  <span className="text-sm">{city.flagEmoji}</span>
                  <span>{city.cityName}</span>
                  {isActive && (
                    <MapPin className="w-3.5 h-3.5 text-[#1A1A1A] animate-bounce shrink-0 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active City Description Note */}
          <div className="text-[11px] sm:text-xs text-emerald-300/90 flex items-center justify-between gap-2 px-1 pt-0.5">
            <span className="truncate">
              📍 <strong className="text-white">{activeCity.cityName}:</strong> {activeCity.description}
            </span>
            <span className="text-[10px] text-emerald-400/70 shrink-0 font-mono">
              City {currentCityIndex + 1} of {HERO_CITY_VIDEOS.length}
            </span>
          </div>

        </div>
      </motion.div>
    </motion.section>
  );
};
