'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MessageCircle, ArrowRight, ShieldCheck, Award, Users, CheckCircle2 } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { FIRM_METRICS } from '@/data/lawFirmData';

interface HeroProps {
  onNavigateToCalc?: () => void;
  onNavigateToPractice?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const [imgSrc] = useState('https://i.ibb.co/5h45Pwhx/hero-section.png');

  const whatsappUrl = buildWhatsAppUrl({
    customMessage: 'Assalamu Alaikum HISK LEGAL, I would like to book a free tax consultation with a High Court Advocate regarding my FBR tax matter.'
  });

  return (
    <motion.section
      id="home"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-24 relative overflow-hidden pt-0.5 sm:pt-1 lg:pt-1 pb-6 sm:pb-12 lg:pb-16 bg-[#FAFAF7]"
    >
      {/* Decorative Subtle Glow */}
      <div className="absolute top-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-[#0F6B4C]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-[#F5A623]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-12 lg:gap-8 items-center">
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-5 lg:space-y-6 text-center lg:text-left items-center lg:items-start">
            {/* Minimal Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center lg:justify-start w-full"
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#E8F5F0] border border-[#0F6B4C]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0F6B4C] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F6B4C]" />
                <span>Trusted Advocacy Solutions Beyond Expectations</span>
              </div>
            </motion.div>

            {/* Outcome-Focused Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[2.5rem] text-[#1A1A1A] leading-snug sm:leading-tight lg:leading-[1.2] tracking-tight text-center lg:text-left"
            >
              <span className="text-[#0F6B4C]">Strategic Legal Representation</span>{' '}
              For Individuals, Businesses &amp; Corporate Clients{' '}
              <span className="text-[#0F6B4C]">Across Pakistan &amp; Beyond</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-xs sm:text-sm lg:text-base text-[#5A6275] font-normal leading-relaxed max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
            >
              <strong className="font-semibold text-[#1A1A1A]">20+ Years of Legal Excellence</strong> — Trusted advocates with over two decades of experience in civil, criminal, family, rent, corporate and tax litigation, successfully safeguarding the interests of 5,000+ businesses and high-net-worth clients under one roof.
            </motion.p>

            {/* Mobile-Only Floating Image (Placed in the middle, between text & CTA) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:hidden relative flex justify-center items-center my-2 py-1 w-full"
            >
              <div className="absolute w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-[#0F6B4C]/20 to-[#F5A623]/25 blur-2xl -z-10 pointer-events-none" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-full max-w-[260px] sm:max-w-sm h-48 sm:h-64 flex items-center justify-center"
              >
                <Image
                  src={imgSrc}
                  alt="HISK LEGAL Legal Defense"
                  fill
                  priority
                  unoptimized
                  className="object-contain object-center drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </motion.div>

            {/* Primary CTA Button (Below Image on Mobile, Below Subheadline on Desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-1 sm:pt-0 w-full lg:w-auto flex justify-center lg:justify-start"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-primary-cta"
                className="w-full sm:w-auto bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-heading font-extrabold text-base sm:text-lg px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2.5 text-center"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-[#1A1A1A]" />
                <span>Book Free Consultation</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </motion.div>

            {/* Trust-Signal Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="pt-3 sm:pt-6 border-t border-[#0F6B4C]/15 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs text-[#5A6275] font-medium w-full"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F6B4C]" />
                <span>
                  <strong className="text-[#1A1A1A] font-extrabold">{FIRM_METRICS.successfulCases}</strong> Successful Cases
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F6B4C]" />
                <span>
                  <strong className="text-[#1A1A1A] font-extrabold">{FIRM_METRICS.clientsServed}</strong> Clients Served
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F6B4C]" />
                <span>
                  <strong className="text-[#1A1A1A] font-extrabold">{FIRM_METRICS.totalTaxSaved}</strong> Tax Saved
                </span>
              </div>
            </motion.div>
          </div>

          {/* Desktop-Only Right Column: Visual with Floating Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, x: 35, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex lg:col-span-5 relative justify-center items-center"
          >
            {/* Background Glow Ring */}
            <div className="absolute w-[480px] h-[480px] lg:w-[540px] lg:h-[540px] rounded-full bg-gradient-to-tr from-[#0F6B4C]/20 to-[#F5A623]/25 blur-3xl -z-10 pointer-events-none" />

            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full lg:max-w-xl h-[500px] lg:h-[580px] flex items-center justify-center"
            >
              <Image
                src={imgSrc}
                alt="HISK LEGAL Legal Defense"
                fill
                priority
                unoptimized
                className="object-contain object-center drop-shadow-2xl scale-110 lg:scale-115"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

