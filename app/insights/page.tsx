'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookMarked,
  Search,
  Clock,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
  BookOpen,
  Filter
} from 'lucide-react';
import { BLOG_POSTS } from '@/data/lawFirmData';
import { usePortalStore } from '@/lib/portalStore';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { Footer } from '@/components/Footer';

export default function InsightsPage() {
  const { insights } = usePortalStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const activePosts = insights && insights.length > 0
    ? insights.filter((p) => p.status !== 'draft' && p.status !== 'archived')
    : BLOG_POSTS;

  const displayPosts = activePosts.length > 0 ? activePosts : BLOG_POSTS;

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(displayPosts.map((p) => p.category)))];

  const filteredPosts = displayPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.keyTakeaways.some((t) => t.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#F5A623] selection:text-[#1A1A1A]">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0F6B4C] text-white shadow-md border-b border-[#0A4B35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 md:h-28 flex items-center justify-between">
          <Link href="/" className="flex items-center group cursor-pointer" title="Return to Home">
            <div className="relative h-[68px] w-[74px] sm:h-[84px] sm:w-[92px] md:h-[96px] md:w-[104px] shrink-0">
              <Image
                src="https://i.ibb.co/V02sjKtY/file-00000000549882089b03c95577e607a2.png"
                alt="HISK LEGAL Logo"
                fill
                unoptimized
                priority
                className="object-contain object-left transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/#insights"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#F5A623] px-3 py-2 rounded-xl transition-colors bg-[#0A4B35]/80 hover:bg-[#0A4B35]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>

            <a
              href={buildWhatsAppUrl({ topic: 'general' })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-[#1A1A1A]" />
              <span className="hidden md:inline">Consult Advocate</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-[#0A4B35] text-white py-12 sm:py-16 relative overflow-hidden border-b border-emerald-900">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-[#F5A623]/30 px-4 py-1.5 rounded-full text-xs font-extrabold text-[#F5A623] mb-4 shadow-sm">
            <BookMarked className="w-4 h-4 text-[#F5A623]" />
            <span>Complete Legal Archive</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-4">
            Legal Insights &amp; Blog
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed font-normal">
            Explore our authoritative legal analysis on FBR tax audits, High Court constitutional writs, Section 7E property tax exemptions, and SECP corporate compliance in Pakistan.
          </p>
        </div>
      </section>

      {/* Main Content Area: Search, Filters, and Article Grid */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Search Bar & Filter Controls */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search legal topics, FBR sections, property tax..."
                id="all-blogs-search-input"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0F6B4C] bg-[#FAFAF7]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results Count Badge */}
            <div className="text-xs text-[#5A6275] font-semibold flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#0F6B4C]" />
              <span>Showing {filteredPosts.length} of {BLOG_POSTS.length} Legal Articles</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#0F6B4C] text-white shadow-xs'
                    : 'bg-[#FAFAF7] text-[#5A6275] hover:bg-gray-200 border border-gray-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A] mb-1">
              No matching articles found
            </h3>
            <p className="text-xs text-[#5A6275] mb-4">
              Try searching with different keywords or select another category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="bg-[#0F6B4C] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:border-[#0F6B4C]/40"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3.5">
                    <span className="bg-[#E8F5F0] text-[#0F6B4C] font-extrabold px-3 py-1 rounded-full border border-[#0F6B4C]/10">
                      {post.category}
                    </span>
                    <span className="text-[#5A6275] flex items-center gap-1 text-[11px] font-medium">
                      <Clock className="w-3.5 h-3.5" /> {post.readTime}
                    </span>
                  </div>

                  <h2 className="font-heading font-extrabold text-lg text-[#1A1A1A] group-hover:text-[#0F6B4C] transition-colors mb-2.5 leading-snug">
                    <Link href={`/insights/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-[#5A6275] line-clamp-3 leading-relaxed mb-6 font-normal">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#5A6275] font-medium">{post.date}</span>

                  <Link
                    href={`/insights/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0F6B4C] group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Article</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
