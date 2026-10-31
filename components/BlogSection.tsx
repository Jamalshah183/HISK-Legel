'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Clock,
  ExternalLink
} from 'lucide-react';
import { BLOG_POSTS } from '@/data/lawFirmData';
import { usePortalStore } from '@/lib/portalStore';

export const BlogSection: React.FC = () => {
  const { insights } = usePortalStore();

  const activePosts = insights && insights.length > 0
    ? insights.filter((p) => p.status !== 'draft' && p.status !== 'archived')
    : BLOG_POSTS;

  // Highlighted Articles for Marquee on Main Page
  const basePosts = (activePosts.length > 0 ? activePosts : BLOG_POSTS).slice(0, 10);

  // Determine marquee list with 2 identical halves for seamless continuous 0% to -50% horizontal scroll
  const cycleMultiplier = Math.max(1, Math.ceil(4 / (basePosts.length || 1)));
  const singleCycle = Array(cycleMultiplier).fill(basePosts).flat();
  const marqueePosts = [...singleCycle, ...singleCycle];

  // Match velocity of Reviews Section cards exactly
  const marqueeDuration = Math.max(30, Math.round(singleCycle.length * 10));

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      id="insights"
      className="scroll-mt-20 sm:scroll-mt-24 py-10 sm:py-14 lg:py-16 bg-white border-y border-gray-100 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Clickable Section Title to View All Insights */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight">
            <Link
              href="/insights"
              className="hover:text-[#0F6B4C] transition-colors inline-block"
              title="Click to view all Legal Insights & Blog articles"
            >
              Legal Insights &amp; Blog
            </Link>
          </h2>
        </motion.div>

        {/* Legal Insights Infinite Marquee (Same Animation as Reviews Section, Pauses on Hover) */}
        <div className="relative w-full overflow-hidden py-4 group">
          {/* Subtle Left & Right Edge Vignette Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div
            className="flex gap-4 sm:gap-6 lg:gap-8 animate-marquee-rtl group-hover:[animation-play-state:paused] w-max py-2"
            style={{ animationDuration: `${marqueeDuration}s` }}
          >
            {marqueePosts.map((post, index) => (
              <article
                key={`${post.id}-${index}`}
                id={`blog-card-${post.id}-${index}`}
                className="w-[85vw] sm:w-[340px] lg:w-[360px] shrink-0 bg-[#FAFAF7] rounded-3xl p-6 border border-[#0F6B4C]/10 shadow-sm hover:shadow-md transition-all duration-300 group/card flex flex-col justify-between hover:border-[#0F6B4C]/30 relative"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3.5">
                    <span className="bg-[#E8F5F0] text-[#0F6B4C] font-extrabold px-3 py-1 rounded-full border border-[#0F6B4C]/10">
                      {post.category}
                    </span>
                    <span className="text-[#5A6275] flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A] group-hover/card:text-[#0F6B4C] transition-colors mb-2.5 leading-snug line-clamp-2">
                    <Link href={`/insights/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5A6275] line-clamp-3 leading-relaxed mb-5 font-normal">
                    {post.excerpt}
                  </p>
                </div>

                <div>
                  <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-[#0F6B4C]">
                    <span className="text-[11px] text-[#5A6275] font-medium">{post.date}</span>
                    <Link
                      href={`/insights/${post.slug}`}
                      className="inline-flex items-center gap-1 hover:underline group-hover/card:translate-x-0.5 transition-transform"
                    >
                      <span>Read Full Article</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
