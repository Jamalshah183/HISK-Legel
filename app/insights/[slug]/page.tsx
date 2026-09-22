'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { BLOG_POSTS } from '@/data/lawFirmData';
import { usePortalStore } from '@/lib/portalStore';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { Footer } from '@/components/Footer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SingleBlogPostPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { insights } = usePortalStore();

  const allPosts = insights && insights.length > 0 ? insights : BLOG_POSTS;
  const post = allPosts.find((p) => p.slug === slug || p.id === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-center items-center p-6 text-center">
        <h1 className="font-heading font-extrabold text-2xl text-[#1A1A1A] mb-2">
          Legal Briefing Not Found
        </h1>
        <p className="text-xs text-[#5A6275] mb-6">
          The requested legal insight or article does not exist or has been updated.
        </p>
        <Link
          href="/insights"
          className="bg-[#0F6B4C] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
        >
          View All Legal Insights &amp; Blog
        </Link>
      </div>
    );
  }

  // Related articles from same or other categories
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug && (p as any).status !== 'archived').slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#F5A623] selection:text-[#1A1A1A]">
      {/* Top Navigation Bar */}
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
              href="/insights"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#F5A623] px-3.5 py-2 rounded-xl transition-colors bg-[#0A4B35]/80 hover:bg-[#0A4B35]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Legal Insights</span>
            </Link>

            <a
              href={buildWhatsAppUrl({
                topic: 'blog_inquiry',
                articleTitle: post.title
              })}
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

      {/* Main Container */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Article Breadcrumb & Metadata */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-[#5A6275] mb-3 flex-wrap font-medium">
            <Link href="/" className="hover:text-[#0F6B4C]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/insights" className="hover:text-[#0F6B4C]">Legal Insights</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#0F6B4C] font-bold truncate max-w-[200px]">{post.category}</span>
          </div>

          <div className="flex items-center gap-3 text-xs mb-4 flex-wrap">
            <span className="bg-[#0F6B4C] text-white font-extrabold px-3 py-1 rounded-full shadow-xs">
              {post.category}
            </span>
            <span className="text-[#5A6275] font-medium">{post.date}</span>
            <span className="text-gray-300">•</span>
            <span className="text-[#5A6275] flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#0F6B4C]" /> {post.readTime}
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#1A1A1A] tracking-tight leading-snug mb-4">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-[#5A6275] leading-relaxed border-l-4 border-[#0F6B4C] pl-4 py-1 italic bg-[#E8F5F0]/40 rounded-r-2xl">
            {post.excerpt}
          </p>
        </div>

        {/* Key Takeaways Section */}
        {post.keyTakeaways && post.keyTakeaways.length > 0 && (
          <div className="bg-[#E8F5F0] p-5 sm:p-6 rounded-3xl border border-[#0F6B4C]/20 mb-8 space-y-3">
            <div className="text-xs font-extrabold text-[#0F6B4C] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#F5A623]" />
              <span>Key Legal Takeaways</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#1A1A1A]">
              {post.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#0F6B4C] shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Content Paragraphs */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/90 shadow-xs space-y-6 mb-10 text-sm sm:text-base text-[#2D3748] leading-relaxed">
          {post.content.map((paragraph, idx) => (
            <p key={idx} className="font-normal">{paragraph}</p>
          ))}
        </div>

        {/* Legal Consultation CTA Box */}
        <div className="bg-[#0F6B4C] text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-12 border border-emerald-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F5A623] bg-[#0A4B35] px-3 py-1 rounded-full border border-[#F5A623]/30">
                Direct Advocate Assistance
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                Facing FBR Audit or High Court Legal Notice?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                Get immediate confidential counsel from our senior High Court Advocates regarding tax appeals, Section 7E exemptions, or corporate stay orders.
              </p>
            </div>

            <a
              href={buildWhatsAppUrl({
                topic: 'blog_inquiry',
                articleTitle: post.title
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-heading font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-2xl shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-[#1A1A1A]" />
              <span>Discuss via WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-gray-200 pt-10">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-[#0F6B4C]" />
              <h3 className="font-heading font-extrabold text-xl text-[#1A1A1A]">
                Related Legal Insights
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedPosts.map((relPost) => (
                <Link
                  key={relPost.id}
                  href={`/insights/${relPost.slug}`}
                  className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#0F6B4C] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-extrabold text-[#0F6B4C] bg-[#E8F5F0] px-2.5 py-1 rounded-full inline-block mb-2.5">
                      {relPost.category}
                    </span>
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-[#1A1A1A] group-hover:text-[#0F6B4C] transition-colors leading-snug line-clamp-2 mb-2">
                      {relPost.title}
                    </h4>
                  </div>
                  <div className="text-[11px] font-bold text-[#0F6B4C] flex items-center justify-between pt-3 border-t border-gray-100">
                    <span>Read Briefing</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
