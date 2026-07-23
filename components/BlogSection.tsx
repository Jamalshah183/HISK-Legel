'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  FileText,
  Clock,
  MessageCircle,
  X,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '@/data/lawFirmData';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export const BlogSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  const categories = ['All', 'FBR Updates', 'Property & 7E', 'IT & Freelancer'];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    return selectedCategory === 'All' || post.category === selectedCategory;
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      id="insights"
      className="py-24 sm:py-32 lg:py-40 bg-white border-y border-gray-100 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#E8F5F0] border border-[#0F6B4C]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#0F6B4C] mb-4">
            <FileText className="w-4 h-4 text-[#F5A623]" />
            <span>FBR Legal Briefings</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight mb-4">
            Tax Insights & Legal Guides
          </h2>
          <p className="text-base sm:text-lg text-[#5A6275]">
            Analysis of FBR income tax slabs, Section 7E property tax exemptions, and IT export proceeds taxation.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center flex-wrap gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              id={`blog-cat-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0F6B4C] text-[#FAFAF7]'
                  : 'bg-[#FAFAF7] text-[#1A1A1A] border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Swipe Indicator for Mobile */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#0F6B4C] bg-[#0F6B4C]/10 px-3.5 py-1.5 rounded-full w-fit mx-auto mb-5 md:hidden">
          <span>Swipe right to see more</span>
          <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
        </div>

        {/* Post Grid */}
        <div className="-mx-4 px-8 scroll-pl-8 sm:-mx-6 sm:px-6 sm:scroll-pl-6 md:mx-0 md:px-0 md:scroll-pl-0 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] md:w-full overflow-x-auto no-scrollbar py-3 touch-auto flex gap-4 sm:gap-6 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8 md:overflow-visible">
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => setActiveArticle(post)}
              id={`blog-card-${post.id}`}
              className="w-[82vw] max-w-[340px] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-start bg-[#FAFAF7] rounded-3xl p-5 sm:p-7 lg:p-8 border border-[#0F6B4C]/10 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group flex flex-col justify-between hover:border-[#0F6B4C]/30"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="bg-[#E8F5F0] text-[#0F6B4C] font-extrabold px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-[#5A6275] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime}
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A] group-hover:text-[#0F6B4C] transition-colors mb-3 leading-snug">
                  {post.title}
                </h3>

                <p className="text-sm text-[#5A6275] line-clamp-2 leading-relaxed mb-6 font-normal">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-[#0F6B4C]">
                <span>Read Full Briefing</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.article>
          ))}
        </div>

        {/* Modal Reader */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-[#0F6B4C]/20 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-[#1A1A1A] hover:bg-gray-200"
                id="close-blog-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 text-xs mb-4">
                <span className="bg-[#0F6B4C] text-white font-bold px-3 py-1 rounded-full">
                  {activeArticle.category}
                </span>
                <span className="text-[#5A6275]">{activeArticle.date}</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl text-[#1A1A1A] mb-6 leading-tight">
                {activeArticle.title}
              </h2>

              <div className="bg-[#E8F5F0] p-5 rounded-2xl border border-[#0F6B4C]/20 mb-6 space-y-2">
                <div className="text-xs font-extrabold text-[#0F6B4C]">
                  Key Takeaways
                </div>
                <ul className="space-y-2 text-xs text-[#1A1A1A]">
                  {activeArticle.keyTakeaways.map((tk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0F6B4C] shrink-0 mt-0.5" />
                      <span>{tk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 text-sm text-[#1A1A1A] leading-relaxed mb-8 font-normal">
                {activeArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <a
                href={buildWhatsAppUrl({
                  topic: 'blog_inquiry',
                  articleTitle: activeArticle.title
                })}
                target="_blank"
                rel="noopener noreferrer"
                id="modal-blog-whatsapp-btn"
                className="w-full bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-heading font-extrabold text-base py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-center"
              >
                <MessageCircle className="w-5 h-5 fill-[#1A1A1A]" />
                <span>Ask Advocate on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};
