'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  GraduationCap,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Award,
  CheckCircle2,
  UserCheck,
  Briefcase,
  Eye,
  Scale,
  FileCheck,
  Building2,
  Gavel,
  TrendingUp,
  Pin
} from 'lucide-react';
import { ATTORNEYS, Attorney } from '@/data/lawFirmData';
import { usePortalStore } from '@/lib/portalStore';
import { TeamMember } from '@/types/portal';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import ceoPortrait from '@/src/assets/images/ceo_kayani_portrait_1784780278642.jpg';

export const AboutSection: React.FC = () => {
  const { teamMembers } = usePortalStore();
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | TeamMember | null>(null);
  const [attorneyImages, setAttorneyImages] = useState<Record<string, string>>({});
  const [isHovered, setIsHovered] = useState(false);
  const teamScrollRef = useRef<HTMLDivElement>(null);

  const activeAttorneys = teamMembers && teamMembers.length > 0 ? teamMembers : ATTORNEYS;

  const handleImageError = (attorneyId: string, currentSrc: string) => {
    if (attorneyId === 'hafiz-irfan-shabber-kayani') {
      if (!currentSrc.includes('ceo_kayani_portrait')) {
        setAttorneyImages((prev) => ({ ...prev, [attorneyId]: ceoPortrait.src }));
      }
    }
  };

  // Pinned/sticky profile on the left side (CEO by default or admin-selected)
  const pinnedAttorney =
    activeAttorneys.find((m) => m.isPinnedLeft) ||
    activeAttorneys.find((m) => m.isCeo) ||
    activeAttorneys[0];

  // Remaining team members that carousel on the right
  const carouselAttorneys = activeAttorneys.filter((m) => m.id !== pinnedAttorney?.id);

  const displayCarouselAttorneys =
    carouselAttorneys.length > 0 && carouselAttorneys.length < 4
      ? [...carouselAttorneys, ...carouselAttorneys]
      : carouselAttorneys;

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (teamScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = teamScrollRef.current;
      const cardWidth = 320;
      if (direction === 'right') {
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          teamScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          teamScrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      } else {
        if (scrollLeft <= 15) {
          teamScrollRef.current.scrollTo({ left: scrollWidth - clientWidth, behavior: 'smooth' });
        } else {
          teamScrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    if (isHovered || displayCarouselAttorneys.length === 0) return;
    const timer = setInterval(() => {
      if (teamScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = teamScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          teamScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          teamScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, displayCarouselAttorneys.length]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      id="about"
      className="scroll-mt-20 sm:scroll-mt-24 py-10 sm:py-14 lg:py-16 bg-[#FAFAF7] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 space-y-3.5"
        >
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mb-3">
            About HISK LEGAL
          </h2>
          <p className="text-base sm:text-lg text-[#3A4255] leading-relaxed font-medium">
            HISK LEGAL is a full-service law firm in Pakistan led by Hafiz Irfan Shabber Kayani, Advocate High Court, Founder &amp; CEO. With over 20 years of advocacy experience, the firm provides strategic, commercially focused legal counsel and representation across tax and FBR matters, corporate and commercial law, civil and criminal litigation, and High Court proceedings.
          </p>
          <p className="text-sm sm:text-base text-[#5A6275] leading-relaxed font-normal">
            We combine rigorous legal analysis, practical strategy and dedicated client representation to protect our clients’ interests, manage legal risk and pursue effective solutions through aggressive litigation in complex legal and commercial matters.
          </p>
        </motion.div>

        {/* Why Clients Trust Us - High-Impact Luxury Legal Showcase */}
        <div className="relative bg-[#0B251C] text-white p-6 sm:p-10 lg:p-14 rounded-3xl border border-[#0F6B4C]/40 shadow-2xl overflow-hidden mb-24">
          {/* Ambient Lighting & Geometric Overlays */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0F6B4C]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#F5A623]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#1A4D3B_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column - Core Strategic Positioning */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-7"
            >
              <h3 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.15] tracking-tight">
                Why Litigants, Corporate Leaders &amp; Taxpayers Trust <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFD07B] to-[#F5A623]">HISK LEGAL</span>
              </h3>

              <p className="text-sm sm:text-base text-[#C2D8D0] leading-relaxed font-light">
                Under the leadership of Founder &amp; CEO Hafiz Irfan Shabber Kayani, HISK LEGAL combines rigorous statutory analysis with proactive courtroom advocacy. Our practice encompasses Civil, Criminal, Corporate, Banking, Property, and Tax law.
              </p>

              {/* Feature Checklist Highlights */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-[#F5A623]/20 text-[#F5A623] mt-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#E2F0EA] font-medium">
                    <strong className="text-white">Emergency Relief:</strong> Immediate stay orders in Civil Cases, Family and Guardian Petitions and against FBR bank account attachments &amp; recovery notices.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-[#F5A623]/20 text-[#F5A623] mt-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#E2F0EA] font-medium">
                    <strong className="text-white">Effective Appellate Advocacy:</strong> Proven records of appellate litigation before High Courts, District and Sessions Courts, Appellate Tribunals &amp; Commissioner Appeals
                  </p>
                </div>
              </div>

              {/* Key Advantage Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#12382A]/80 border border-[#0F6B4C] p-3.5 rounded-2xl text-center backdrop-blur-sm">
                  <div className="font-heading font-black text-xl sm:text-2xl text-[#F5A623]">High Court</div>
                  <div className="text-[10px] sm:text-xs text-[#9EBEB2] font-semibold mt-0.5">Appellate Rights</div>
                </div>
                <div className="bg-[#12382A]/80 border border-[#0F6B4C] p-3.5 rounded-2xl text-center backdrop-blur-sm">
                  <div className="font-heading font-black text-xl sm:text-2xl text-white">PKR 10B+</div>
                  <div className="text-[10px] sm:text-xs text-[#9EBEB2] font-semibold mt-0.5">Tax Liabilities Defended</div>
                </div>
                <div className="bg-[#12382A]/80 border border-[#0F6B4C] p-3.5 rounded-2xl text-center backdrop-blur-sm col-span-2 sm:col-span-1">
                  <div className="font-heading font-black text-xl sm:text-2xl text-[#F5A623]">24/7</div>
                  <div className="text-[10px] sm:text-xs text-[#9EBEB2] font-semibold mt-0.5">Urgent Stay Counsel</div>
                </div>
              </div>

              <div className="pt-3">
                <a
                  href={buildWhatsAppUrl({
                    customMessage: 'Assalamu Alaikum, I would like to schedule a confidential consultation with HISK LEGAL advocates.'
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#F5A623] to-[#D98E11] hover:from-[#E0951C] hover:to-[#C27E0B] text-[#0B251C] font-heading font-extrabold text-sm sm:text-base py-4 px-7 rounded-2xl transition-all shadow-xl hover:shadow-[#F5A623]/20 hover:-translate-y-0.5 w-full sm:w-auto text-center"
                >
                  <MessageCircle className="w-4.5 h-4.5 text-[#0B251C] fill-[#0B251C]" />
                  <span>Schedule Advocate Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Right Column - Glassmorphic Pillar Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-6 space-y-5"
            >
              <div className="group relative bg-[#12382A]/90 hover:bg-[#184836] p-6 rounded-2xl border border-[#0F6B4C] hover:border-[#F5A623]/60 transition-all shadow-lg hover:shadow-2xl">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F6B4C] to-[#08422F] border border-[#0F6B4C] text-[#F5A623] shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-md">
                    <Gavel className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-heading font-extrabold text-base sm:text-lg text-white group-hover:text-[#F5A623] transition-colors">
                      Deep Legal Understanding
                    </h4>
                    <p className="text-xs sm:text-sm text-[#C2D8D0] leading-relaxed font-light">
                      A thorough understanding of Pakistani law, procedure and the complexities of every matter we undertake.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-[#12382A]/90 hover:bg-[#184836] p-6 rounded-2xl border border-[#0F6B4C] hover:border-[#F5A623]/60 transition-all shadow-lg hover:shadow-2xl">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F6B4C] to-[#08422F] border border-[#0F6B4C] text-[#F5A623] shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-md">
                    <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-heading font-extrabold text-base sm:text-lg text-white group-hover:text-[#F5A623] transition-colors">
                      Strategic Legal Approach
                    </h4>
                    <p className="text-xs sm:text-sm text-[#C2D8D0] leading-relaxed font-light">
                      Careful assessment, practical advice and a focused strategy designed around each client&apos;s objectives and legal position.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-[#12382A]/90 hover:bg-[#184836] p-6 rounded-2xl border border-[#0F6B4C] hover:border-[#F5A623]/60 transition-all shadow-lg hover:shadow-2xl">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F6B4C] to-[#08422F] border border-[#0F6B4C] text-[#F5A623] shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-md">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-heading font-extrabold text-base sm:text-lg text-white group-hover:text-[#F5A623] transition-colors">
                      Decisive Litigation
                    </h4>
                    <p className="text-xs sm:text-sm text-[#C2D8D0] leading-relaxed font-light">
                      Strong, well-prepared advocacy and determined representation before courts and relevant forums.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Senior Attorney Roster - Stationary Pinned Leader + Carousel Track */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto mb-8"
          >
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0F6B4C] bg-[#0F6B4C]/10 px-3 py-1 rounded-full border border-[#0F6B4C]/20 mb-3 inline-block">
              HISK LEGAL ADVOCATES &amp; COUNSEL
            </span>
            <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight">
              Our Team
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
              Led by seasoned High Court advocates delivering strategic litigation, corporate compliance, and results-driven defense.
            </p>
          </motion.div>

          {/* Dual-Column Layout: Left Sticky Pinned Profile + Right Carousel */}
          <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
            {/* LEFT: Pinned / Stationary CEO or Selected Leader Profile */}
            {pinnedAttorney && (
              <div className="w-full lg:w-[350px] xl:w-[370px] shrink-0 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2 px-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F6B4C] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>{pinnedAttorney.isCeo ? 'Firm Leadership' : 'Senior Advocate'}</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Pin className="w-3 h-3 fill-amber-500 text-amber-700" />
                    <span>Stationary Profile</span>
                  </span>
                </div>

                {/* Highlighted Sticky Leader Card */}
                <div
                  id={`team-card-${pinnedAttorney.id}-pinned`}
                  onClick={() => setSelectedAttorney(pinnedAttorney)}
                  className="group/card relative w-full h-[460px] sm:h-[490px] rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-end bg-slate-900 border-2 border-[#F5A623] shadow-2xl ring-4 ring-[#F5A623]/25 transition-all duration-300 hover:ring-[#F5A623]/50 hover:shadow-[#F5A623]/20"
                >
                  {/* Subtle Glowing Corner Highlight */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-[#F5A623]/20 rounded-full blur-2xl pointer-events-none z-10" />

                  {/* Background Portrait Image */}
                  <Image
                    src={attorneyImages[pinnedAttorney.id] || pinnedAttorney.image}
                    alt={pinnedAttorney.name}
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-700 group-hover/card:scale-105"
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError(pinnedAttorney.id, attorneyImages[pinnedAttorney.id] || pinnedAttorney.image)}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2">
                    <div className="bg-[#0F6B4C] text-[#F5A623] text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-[#F5A623]/40">
                      <Award className="w-3.5 h-3.5 text-[#F5A623]" />
                      <span>{pinnedAttorney.isCeo ? 'FOUNDER & CEO' : 'SENIOR COUNSEL'}</span>
                    </div>
                    <div className="bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-400/40 flex items-center gap-1 shadow-md">
                      <Pin className="w-3 h-3 fill-amber-400 text-amber-300" />
                      <span>Stationary Lead</span>
                    </div>
                  </div>

                  {/* Hover Overlay Hint */}
                  <div className="absolute inset-0 bg-[#0F6B4C]/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-xs text-[#0F6B4C] font-extrabold text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 transform translate-y-3 group-hover/card:translate-y-0 transition-transform duration-300">
                      <Eye className="w-4 h-4 text-[#F5A623]" />
                      <span>Click to Reveal Executive Bio</span>
                    </div>
                  </div>

                  {/* Bottom Dark Gradient Footer */}
                  <div className="relative z-20 p-5 sm:p-6 bg-gradient-to-t from-black/95 via-black/75 to-transparent text-white space-y-2 text-left border-t border-[#F5A623]/20">
                    <div className="text-[11px] text-[#F5A623] font-extrabold uppercase tracking-wider">
                      {pinnedAttorney.isCeo ? 'Founder & Chief Executive Officer' : 'Senior Counsel'}
                    </div>
                    <h4 className="font-heading font-extrabold text-xl sm:text-2xl text-white leading-tight group-hover/card:text-[#F5A623] transition-colors">
                      {pinnedAttorney.name}
                    </h4>
                    <p className="text-xs text-gray-200 line-clamp-2 font-normal leading-relaxed">
                      {pinnedAttorney.bio || pinnedAttorney.title}
                    </p>

                    <div className="pt-2">
                      <div className="w-full bg-[#F5A623] hover:bg-[#E0951C] text-[#0B251C] text-xs font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group-hover/card:shadow-lg">
                        <span>Click to Reveal Full Details</span>
                        <ChevronRight className="w-4 h-4 text-[#0B251C]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT: Remaining Team Members Carousel Track */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3 mb-2 px-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A6275]">
                  Associates &amp; Legal Team ({carouselAttorneys.length})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 hidden sm:inline">Scroll through firm advocates</span>
                  <button
                    type="button"
                    onClick={() => handleManualScroll('left')}
                    id="team-carousel-prev-btn"
                    aria-label="Previous team member"
                    className="w-8 h-8 rounded-full bg-white border border-[#0F6B4C]/25 text-[#0F6B4C] hover:bg-[#0F6B4C] hover:text-white transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleManualScroll('right')}
                    id="team-carousel-next-btn"
                    aria-label="Next team member"
                    className="w-8 h-8 rounded-full bg-white border border-[#0F6B4C]/25 text-[#0F6B4C] hover:bg-[#0F6B4C] hover:text-white transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Cards Track */}
              <div
                className="w-full relative group py-1"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Subtle Right Edge Vignette */}
                <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAFAF7] via-[#FAFAF7]/80 to-transparent z-10 pointer-events-none" />

                <div
                  ref={teamScrollRef}
                  className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-1 snap-x snap-mandatory scroll-smooth"
                >
                  {displayCarouselAttorneys.map((attorney, idx) => {
                    const imageSrc = attorneyImages[attorney.id] || attorney.image;
                    const isCeo = attorney.isCeo;

                    return (
                      <div
                        key={`${attorney.id}-${idx}`}
                        id={`team-card-${attorney.id}-${idx}`}
                        onClick={() => setSelectedAttorney(attorney)}
                        className="group/card relative w-[280px] sm:w-[310px] md:w-[320px] shrink-0 h-[460px] sm:h-[490px] rounded-3xl overflow-hidden border border-[#0F6B4C]/20 hover:border-[#0F6B4C]/50 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-end bg-slate-900 snap-start"
                      >
                        {/* Background Portrait Image */}
                        <Image
                          src={imageSrc}
                          alt={attorney.name}
                          fill
                          unoptimized
                          className="object-cover object-top transition-transform duration-700 group-hover/card:scale-105"
                          referrerPolicy="no-referrer"
                          onError={() => handleImageError(attorney.id, imageSrc)}
                        />

                        {/* Top Badge */}
                        {isCeo && (
                          <div className="absolute top-4 left-4 z-20 bg-[#0F6B4C] text-[#F5A623] text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-[#F5A623]/30">
                            <Award className="w-3.5 h-3.5 text-[#F5A623]" />
                            <span>FOUNDER &amp; CEO</span>
                          </div>
                        )}

                        {/* Hover Overlay Hint */}
                        <div className="absolute inset-0 bg-[#0F6B4C]/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center p-4">
                          <div className="bg-white/95 backdrop-blur-xs text-[#0F6B4C] font-extrabold text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 transform translate-y-3 group-hover/card:translate-y-0 transition-transform duration-300">
                            <Eye className="w-4 h-4 text-[#F5A623]" />
                            <span>Click to Reveal Full Details</span>
                          </div>
                        </div>

                        {/* Bottom Dark Gradient Footer */}
                        <div className="relative z-20 p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-white space-y-2 text-left">
                          <div className="text-[11px] text-[#F5A623] font-extrabold uppercase tracking-wider">
                            {isCeo ? 'Founder & Chief Executive Officer' : 'Associate Counsel'}
                          </div>
                          <h4 className="font-heading font-extrabold text-lg sm:text-xl text-white leading-tight group-hover/card:text-[#F5A623] transition-colors">
                            {attorney.name}
                          </h4>
                          <p className="text-xs text-gray-300 line-clamp-1 font-medium">
                            {attorney.title}
                          </p>

                          <div className="pt-2">
                            <div className="w-full bg-[#0F6B4C] group-hover/card:bg-[#0A4B35] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                              <span>Click to Reveal Details</span>
                              <ChevronRight className="w-4 h-4 text-[#F5A623]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attorney Full Bio Modal */}
      <AnimatePresence>
        {selectedAttorney && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAttorney(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#0F6B4C]/20 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Top Banner */}
              <div className="bg-[#0F6B4C] text-white p-6 sm:p-8 relative shrink-0">
                <button
                  onClick={() => setSelectedAttorney(null)}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-[#F5A623]/60 shadow-lg bg-emerald-900">
                    <Image
                      src={attorneyImages[selectedAttorney.id] || selectedAttorney.image}
                      alt={selectedAttorney.name}
                      fill
                      unoptimized
                      className="object-cover object-top"
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError(selectedAttorney.id, attorneyImages[selectedAttorney.id] || selectedAttorney.image)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {selectedAttorney.isCeo && (
                      <div className="inline-flex items-center gap-1 bg-[#F5A623] text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                        <Award className="w-3 h-3 text-black" />
                        <span>FOUNDER &amp; CHIEF EXECUTIVE OFFICER</span>
                      </div>
                    )}
                    <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                      {selectedAttorney.name}
                    </h3>
                    <div className="text-xs sm:text-sm text-[#F5A623] font-bold">
                      {selectedAttorney.title}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 divide-y divide-gray-100">
                {/* Credentials & Specialties */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0F6B4C]">
                    Credentials &amp; Key Practice Areas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAttorney.credentials.map((cred, idx) => (
                      <span
                        key={idx}
                        className="bg-[#E8F5F0] text-[#0F6B4C] text-xs font-extrabold px-3 py-1 rounded-lg border border-[#0F6B4C]/20"
                      >
                        {cred}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs sm:text-sm text-[#1A1A1A] font-semibold bg-[#FAFAF7] p-3.5 rounded-xl border border-gray-200">
                    <span className="text-[#0F6B4C] font-bold">Practice Scope:</span> {selectedAttorney.specialty}
                  </div>
                </div>

                {/* Full Biography */}
                <div className="pt-6 space-y-4 text-sm sm:text-base text-[#3A4252] leading-relaxed">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0F6B4C] mb-2">
                    Professional Biography
                  </div>

                  {selectedAttorney.fullBio ? (
                    selectedAttorney.fullBio.map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-sm sm:text-base text-[#1A1A1A] leading-relaxed font-normal">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm sm:text-base text-[#1A1A1A] leading-relaxed font-normal">
                      {selectedAttorney.bio}
                    </p>
                  )}
                </div>

                {/* Key Achievements */}
                <div className="pt-6">
                  <div className="flex items-start gap-3 bg-[#E8F5F0] p-4 rounded-2xl border border-[#0F6B4C]/20">
                    <CheckCircle2 className="w-5 h-5 text-[#0F6B4C] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs uppercase text-[#0F6B4C]">Strategic Impact</div>
                      <div className="text-xs sm:text-sm text-[#1A1A1A] mt-0.5 font-medium">{selectedAttorney.keyWin}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <button
                  onClick={() => setSelectedAttorney(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 font-bold text-xs text-[#5A6275] hover:bg-gray-100 transition-colors"
                >
                  Close Profile
                </button>

                <a
                  href={buildWhatsAppUrl({
                    customMessage: `Assalamu Alaikum Advocate ${selectedAttorney.name}, I would like to consult with you directly regarding a legal matter for HISK LEGAL.`
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-[#0F6B4C] hover:bg-[#0A4B35] text-white font-heading font-bold text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4 text-[#F5A623]" />
                  <span>Consult Advocate on WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
