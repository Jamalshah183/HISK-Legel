'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  BookMarked,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { BLOG_POSTS } from '@/data/lawFirmData';

export const BlogSection: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  // 10 Highlighted Articles for Slideshow on Main Page
  const highlightedPosts = BLOG_POSTS.slice(0, 10);

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
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#E8F5F0] border border-[#0F6B4C]/20 px-4 py-1.5 rounded-full text-xs font-extrabold text-[#0F6B4C] mb-3">
            <BookMarked className="w-4 h-4 text-[#F5A623]" />
            <span>FBR &amp; Legal Analysis</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight mb-3">
            Legal Insights &amp; Blog
          </h2>

          <p className="text-base sm:text-lg text-[#5A6275] leading-relaxed">
            In-depth High Court litigation updates, FBR income tax slabs, Section 7E property tax exemptions, and IT export proceeds compliance.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href="/insights"
              id="view-all-articles-btn"
              className="inline-flex items-center gap-2 bg-[#0F6B4C] hover:bg-[#0A4B35] text-white text-xs font-extrabold py-2.5 px-5 rounded-full shadow-md transition-all hover:shadow-lg"
            >
              <BookOpen className="w-4 h-4 text-[#F5A623]" />
              <span>View All Articles Directory (Separate Page)</span>
            </Link>
          </div>
        </motion.div>

        {/* Slideshow Controls Bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F6B4C]">
            <Sparkles className="w-4 h-4 text-[#F5A623]" />
            <span className="uppercase tracking-wider">10 Highlighted Briefings</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevSlide}
              id="blog-slideshow-prev-btn"
              aria-label="Previous article"
              className="p-2 rounded-full border border-gray-200 bg-[#FAFAF7] hover:bg-[#E8F5F0] hover:text-[#0F6B4C] text-[#1A1A1A] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextSlide}
              id="blog-slideshow-next-btn"
              aria-label="Next article"
              className="p-2 rounded-full border border-gray-200 bg-[#FAFAF7] hover:bg-[#E8F5F0] hover:text-[#0F6B4C] text-[#1A1A1A] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slideshow Carousel Container */}
        <div
          ref={carouselRef}
          className="flex gap-5 overflow-x-auto no-scrollbar py-3 px-1 snap-x snap-mandatory scroll-smooth"
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

        {/* Separate Page CTA Bar at Bottom */}
        <div className="mt-8 text-center bg-[#FAFAF7] rounded-2xl p-4 sm:p-6 border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="font-heading font-extrabold text-base text-[#1A1A1A]">
              Looking for a specific legal briefing or tax ruling?
            </div>
            <div className="text-xs text-[#5A6275] mt-0.5">
              Browse our complete archive of High Court writs, FBR notices, and corporate compliance guides on a single dedicated page.
            </div>
          </div>
          <Link
            href="/insights"
            id="open-directory-page-btn"
            className="shrink-0 bg-[#0F6B4C] hover:bg-[#0A4B35] text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#F5A623]" />
            <span>Open All Articles Page</span>
          </Link>
        </div>
      </div>
    </motion.section>
  );
};
