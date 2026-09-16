'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Star,
  ShieldCheck,
  Quote
} from 'lucide-react';
import { TESTIMONIALS } from '@/data/lawFirmData';
import { usePortalStore } from '@/lib/portalStore';

export const ReviewsSection: React.FC = () => {
  const { reviews } = usePortalStore();
  const activeReviews = reviews && reviews.length > 0
    ? reviews.filter((r) => r.status !== 'archived')
    : TESTIMONIALS;
  const displayReviews = activeReviews.length > 0 ? activeReviews : TESTIMONIALS;

  // Calculate dynamic average rating
  const avgRating = (
    displayReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / displayReviews.length
  ).toFixed(2);

  // Determine marquee list (repeat enough times for seamless continuous horizontal scroll)
  const repeatCount = Math.max(2, Math.ceil(8 / displayReviews.length));
  const marqueeItems = Array(repeatCount).fill(displayReviews).flat();

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      id="reviews"
      className="scroll-mt-20 sm:scroll-mt-24 py-10 sm:py-14 lg:py-16 bg-[#FAFAF7] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-6 sm:mb-8"
        >
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight mb-4">
            Testimonials &amp; client experiences
          </h2>
          <p className="text-base sm:text-lg text-[#5A6275] font-normal">
            Hear from individuals and businesses who have entrusted HISK LEGAL with their most important legal matters.
          </p>
        </motion.div>

        {/* Aggregate Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 25, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="bg-white rounded-3xl p-8 border border-[#0F6B4C]/15 shadow-sm mb-16 max-w-3xl mx-auto grid sm:grid-cols-3 gap-6 text-center items-center"
        >
          <div>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#F5A623] fill-[#F5A623]" />
              ))}
            </div>
            <div className="font-heading font-extrabold text-3xl text-[#1A1A1A]">{avgRating} / 5.0</div>
            <div className="text-xs text-[#5A6275] font-medium mt-1">Client Rating</div>
          </div>

          <div className="sm:border-x border-gray-200 sm:px-6">
            <div className="font-heading font-extrabold text-3xl text-[#0F6B4C]">Rs. 50 Crore+</div>
            <div className="text-xs text-[#5A6275] font-medium mt-1">FBR Tax Saved</div>
          </div>

          <div>
            <div className="font-heading font-extrabold text-3xl text-[#1A1A1A]">100%</div>
            <div className="text-xs text-[#5A6275] font-medium mt-1">Advocate Privilege</div>
          </div>
        </motion.div>

        {/* Testimonials Infinite Marquee (Moving Right to Left, Pauses on Hover) */}
        <div className="relative w-full overflow-hidden py-4 mb-16 group">
          {/* Edge Gradient Fades for smooth entry/exit */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-[#FAFAF7] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-[#FAFAF7] to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="flex gap-4 sm:gap-6 lg:gap-8 animate-marquee-rtl group-hover:[animation-play-state:paused] w-max">
            {marqueeItems.map((review, idx) => (
              <div
                key={`${review.id}-${idx}`}
                className="w-[85vw] sm:w-[380px] md:w-[420px] lg:w-[460px] shrink-0 bg-white rounded-3xl p-6 sm:p-8 border border-[#0F6B4C]/15 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group/card"
              >
                <Quote className="w-10 h-10 text-[#0F6B4C]/10 absolute top-6 right-6" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#F5A623] fill-[#F5A623]" />
                      ))}
                    </div>
                    {review.verifiedBadge && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#0F6B4C] bg-[#E8F5F0] px-2.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0F6B4C]" /> Verified Case
                      </span>
                    )}
                  </div>

                  <div className="bg-[#1A1A1A] text-[#FAFAF7] px-4 py-2 rounded-xl inline-block mb-4">
                    <span className="text-[10px] text-gray-300 uppercase tracking-wider block font-bold">
                      Legal Impact
                    </span>
                    <span className="font-heading font-extrabold text-lg text-[#F5A623]">
                      {review.dollarSaved} Saved
                    </span>
                  </div>

                  <p className="text-sm text-[#1A1A1A] leading-relaxed mb-6 font-normal italic">
                    &quot;{review.reviewText}&quot;
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-[#1A1A1A] text-sm">{review.clientInitials}</div>
                    <div className="text-[#5A6275]">{review.clientRole} • {review.location}</div>
                  </div>
                  <div className="text-right text-xs text-[#0F6B4C] font-extrabold">
                    {review.caseType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
