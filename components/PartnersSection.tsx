'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Building2 } from 'lucide-react';
import { usePortalStore } from '@/lib/portalStore';
import { INITIAL_PARTNERS } from '@/data/portalSeedData';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

export const PartnersSection: React.FC = () => {
  const { partners } = usePortalStore();

  const activePartners = partners && partners.length > 0
    ? partners.filter((p) => p.status !== 'archived')
    : INITIAL_PARTNERS;

  const displayPartners = activePartners.length > 0 ? activePartners : INITIAL_PARTNERS;

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
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mb-4">
            Membership and Partners
          </h2>
          <p className="text-base sm:text-lg text-[#5A6275] font-normal leading-relaxed">
            Proudly affiliated with premier bar associations, judicial bodies, corporate regulators, and statutory bodies across Pakistan.
          </p>
        </motion.div>

        {/* Partners Infinite Slider Marquee Container */}
        <div className="relative w-full overflow-hidden py-4">
          {/* Edge Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-white via-white/85 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-white via-white/85 to-transparent z-10 pointer-events-none" />

          <InfiniteSlider gap={24} duration={30} durationOnHover={55} className="w-full py-2">
            {displayPartners.map((partner) => {
              const hasWebsite = partner.websiteUrl && partner.websiteUrl !== '#';

              const CardContent = (
                <div className="w-[180px] sm:w-[220px] md:w-[240px] shrink-0 h-28 sm:h-32 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#0F6B4C]/15 shadow-sm hover:shadow-xl hover:border-[#0F6B4C]/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center relative group/card overflow-hidden">
                  {partner.logoUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center p-1">
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        fill
                        className="object-contain p-2 filter grayscale group-hover/card:grayscale-0 group-hover/card:scale-105 transition-all duration-300"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#0F6B4C] font-extrabold text-xs sm:text-sm text-center px-2">
                      <Building2 className="w-5 h-5 text-[#C5A059] shrink-0" />
                      <span className="line-clamp-2">{partner.name}</span>
                    </div>
                  )}
                </div>
              );

              if (hasWebsite) {
                return (
                  <a
                    key={partner.id}
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={partner.name}
                    className="block shrink-0 focus:outline-none"
                  >
                    {CardContent}
                  </a>
                );
              }

              return (
                <div key={partner.id} title={partner.name} className="shrink-0">
                  {CardContent}
                </div>
              );
            })}
          </InfiniteSlider>
        </div>
      </div>
    </motion.section>
  );
};
