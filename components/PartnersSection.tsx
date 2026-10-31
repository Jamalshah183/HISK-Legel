'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Award, ExternalLink, Building2, ShieldCheck } from 'lucide-react';
import { usePortalStore } from '@/lib/portalStore';
import { INITIAL_PARTNERS } from '@/data/portalSeedData';

export const PartnersSection: React.FC = () => {
  const { partners } = usePortalStore();

  const activePartners = partners && partners.length > 0
    ? partners.filter((p) => p.status !== 'archived')
    : INITIAL_PARTNERS;

  const displayPartners = activePartners.length > 0 ? activePartners : INITIAL_PARTNERS;

  // Determine marquee list with identical cycles for seamless continuous horizontal scroll
  const cycleCount = Math.max(1, Math.ceil(5 / (displayPartners.length || 1)));
  const singleCycle = Array(cycleCount).fill(displayPartners).flat();
  const marqueeItems = [...singleCycle, ...singleCycle];

  // Match velocity of Reviews Section cards (~10s per item multiplier)
  const marqueeDuration = Math.max(30, Math.round(singleCycle.length * 10));

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      id="partners"
      className="scroll-mt-20 sm:scroll-mt-24 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-[#FAFAF7] to-white border-y border-gray-100 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#E8F5F0] text-[#0F6B4C] border border-[#0F6B4C]/20 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase mb-3">
            <Award className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Official Affiliations &amp; Accreditations</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mb-4">
            Membership and Partners
          </h2>
          <p className="text-base sm:text-lg text-[#5A6275] font-normal leading-relaxed">
            Proudly affiliated with premier bar associations, judicial bodies, corporate regulators, and statutory tax authorities across Pakistan.
          </p>
        </motion.div>

        {/* Partners Infinite Marquee (Moving Right to Left, Pauses on Hover) */}
        <div className="relative w-full overflow-hidden py-4 group">
          {/* Edge Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div
            className="flex gap-4 sm:gap-6 lg:gap-8 animate-marquee-rtl group-hover:[animation-play-state:paused] w-max py-2"
            style={{ animationDuration: `${marqueeDuration}s` }}
          >
            {marqueeItems.map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 bg-white rounded-3xl p-6 border border-[#0F6B4C]/15 shadow-sm hover:shadow-lg hover:border-[#0F6B4C]/40 transition-all duration-300 flex flex-col justify-between relative group/card"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-extrabold text-[#0F6B4C] bg-[#E8F5F0] border border-[#0F6B4C]/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0F6B4C]" />
                      {partner.category || 'Affiliate Member'}
                    </span>

                    {partner.websiteUrl && partner.websiteUrl !== '#' && (
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#5A6275] hover:text-[#0F6B4C] transition-colors p-1 rounded-lg hover:bg-gray-100"
                        title={`Visit ${partner.name}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Logo Container */}
                  <div className="h-20 w-full bg-[#FAFAF7] rounded-2xl border border-gray-100 p-3 mb-4 flex items-center justify-center relative overflow-hidden group-hover/card:bg-[#E8F5F0]/30 transition-colors">
                    {partner.logoUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={partner.logoUrl}
                          alt={partner.name}
                          fill
                          className="object-contain p-1 filter grayscale group-hover/card:grayscale-0 transition-all duration-300"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[#0F6B4C] font-extrabold text-sm">
                        <Building2 className="w-6 h-6 text-[#C5A059]" />
                        <span>{partner.name}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#1A1A1A] group-hover/card:text-[#0F6B4C] transition-colors line-clamp-2 leading-snug">
                    {partner.name}
                  </h3>

                  {partner.description && (
                    <p className="text-xs text-[#5A6275] line-clamp-2 mt-2 leading-relaxed">
                      {partner.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#5A6275]">
                  <span className="font-semibold text-[11px] text-[#C5A059]">Verified Partner</span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">HISK LEGAL</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
