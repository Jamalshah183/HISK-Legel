'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import { BLOG_POSTS } from '@/data/lawFirmData';
import { usePortalStore } from '@/lib/portalStore';

export const BlogSection: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { insights } = usePortalStore();

  const activePosts = insights && insights.length > 0
    ? insights.filter((p) => p.status !== 'draft' && p.status !== 'archived')
    : BLOG_POSTS;

  // 10 Highlighted Articles for Slideshow on Main Page
  const highlightedPosts = (activePosts.length > 0 ? activePosts : BLOG_POSTS).slice(0, 10);

  const handlePrevSlide = () => {
    if (carouselRef.current) {
      const cardWidth = 360;
      carouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const handleNextSlide = () => {
    if (carouselRef.current) {
      const cardWidth = 360;
      carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 sm:mb-10 flex flex-col items-center sm:justify-center text-center"
        >
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight">
            Legal Insights &amp; Blog
          </h2>

          <div className="mt-4 sm:mt-0 sm:absolute sm:right-0">
            <Link
              href="/insights"
              id="view-all-insights-btn"
              className="inline-flex items-center gap-2 bg-[#0F6B4C] hover:bg-[#0A4B35] text-white font-heading font-bold text-xs sm:text-sm py-2.5 px-4 sm:px-5 rounded-xl shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer"
            >
              <span>See All Insights</span>
              <ChevronRight className="w-4 h-4 text-[#F5A623]" />
            </Link>
          </div>
        </motion.div>

        {/* Slideshow Carousel Wrapper with End-Positioned Left/Right Buttons */}
        <div className="relative group">
          {/* Subtle Left & Right Edge Vignette Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none rounded-l-3xl" />
          <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none rounded-r-3xl" />

          {/* Left End Navigation Button */}
          <button
            onClick={handlePrevSlide}
            id="blog-slideshow-prev-btn"
            aria-label="Previous article"
            className="absolute left-1 sm:left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#0F6B4C]/25 text-[#0F6B4C] shadow-lg hover:shadow-xl hover:bg-[#0F6B4C] hover:text-white transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0F6B4C] active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Right End Navigation Button */}
          <button
            onClick={handleNextSlide}
            id="blog-slideshow-next-btn"
            aria-label="Next article"
            className="absolute right-1 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#0F6B4C]/25 text-[#0F6B4C] shadow-lg hover:shadow-xl hover:bg-[#0F6B4C] hover:text-white transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0F6B4C] active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Slideshow Carousel Container */}
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto no-scrollbar py-3 px-3 sm:px-6 snap-x snap-mandatory scroll-smooth"
          >
          {highlightedPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              id={`blog-card-${post.id}`}
              className="w-[85vw] sm:w-[340px] lg:w-[360px] shrink-0 snap-start bg-[#FAFAF7] rounded-3xl p-6 border border-[#0F6B4C]/10 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between hover:border-[#0F6B4C]/30 relative"
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

                <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A] group-hover:text-[#0F6B4C] transition-colors mb-2.5 leading-snug line-clamp-2">
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
                    className="inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Full Article</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
