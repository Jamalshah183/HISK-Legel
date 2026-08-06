'use client';

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  AlertTriangle,
  Scale,
  HelpCircle,
  Building2,
  FileCheck,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { buildWhatsAppUrl, WhatsAppTopic } from '@/lib/whatsapp';

export interface NoticeQuestionCard {
  id: string;
  badge: string;
  question: string;
  description: string;
  icon: React.ElementType;
  topic: WhatsAppTopic;
  customMessage: string;
  buttonLabel: string;
}

export const EMERGENCY_QUESTIONS: NoticeQuestionCard[] = [
  {
    id: 'fbr-notice',
    badge: 'Tax Emergency',
    question: 'FBR Notice Received?',
    description: 'Received Section 122 reassessment, Section 177 audit, Section 214C notice, or show-cause from FBR? Get High Court stay order & reply drafted by Advocate.',
    icon: Shield,
    topic: 'fbr_audit',
    customMessage: 'Assalamu Alaikum HISK LEGAL, I received an FBR tax notice / audit demand and need urgent legal representation.',
    buttonLabel: 'Chat Now on WhatsApp'
  },
  {
    id: 'fir-registered',
    badge: 'Criminal & Bail',
    question: 'FIR Registered?',
    description: 'Facing criminal FIR registration, pre-arrest bail petition, FIA cyber crime wing inquiry, or police investigation? Immediate High Court bail advocacy.',
    icon: AlertTriangle,
    topic: 'criminal_fir',
    customMessage: 'Assalamu Alaikum HISK LEGAL, an FIR has been registered and I need urgent criminal law & bail legal assistance.',
    buttonLabel: 'Chat Now on WhatsApp'
  },
  {
    id: 'civil-case',
    badge: 'Civil & Property',
    question: 'Civil Case Filed?',
    description: 'Property title dispute, rent controller eviction suit, contract breach, or commercial injunction required? Defense before District & High Courts.',
    icon: Scale,
    topic: 'civil_case',
    customMessage: 'Assalamu Alaikum HISK LEGAL, a civil suit / property case has been filed and I need advocate representation.',
    buttonLabel: 'Chat Now on WhatsApp'
  },
  {
    id: 'legal-consultation',
    badge: 'Legal Advisory',
    question: 'Legal Consultation Required?',
    description: 'Need legal opinion on SECP corporate compliance, Section 7E property tax clearance, international IT export treaties, or High Court writ petitions?',
    icon: HelpCircle,
    topic: 'general',
    customMessage: 'Assalamu Alaikum HISK LEGAL, I require a legal consultation with a High Court Advocate for my legal matter.',
    buttonLabel: 'Chat Now on WhatsApp'
  },
  {
    id: 'bank-attachment',
    badge: 'Urgent Action',
    question: 'Bank Account Attached (Sec 140)?',
    description: 'FBR attached your corporate or personal bank account under Section 140 without prior notice? Emergency High Court stay order petition filing.',
    icon: Building2,
    topic: 'fbr_audit',
    customMessage: 'Assalamu Alaikum HISK LEGAL, FBR has attached my bank account under Section 140 and I need emergency High Court stay order relief.',
    buttonLabel: 'Chat Now on WhatsApp'
  },
  {
    id: 'section-7e',
    badge: 'Property Tax',
    question: 'Section 7E Property Tax Demand?',
    description: 'Challenging 7E deemed income tax on capital assets, plots, or residential properties? Obtain High Court exemption certificate & legal defense.',
    icon: FileCheck,
    topic: 'fbr_audit',
    customMessage: 'Assalamu Alaikum HISK LEGAL, I received a Section 7E property tax notice and require exemption / High Court legal defense.',
    buttonLabel: 'Chat Now on WhatsApp'
  }
];

export const FacingFbrNoticeSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollPrev = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      id="facing-fbr-notice"
      className="py-10 sm:py-14 bg-gradient-to-b from-white via-[#FAFAF7] to-white border-y border-gray-200/80 relative overflow-hidden"
    >
      {/* Decorative Subtle Background Glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#0F6B4C]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#E8F5F0] border border-[#0F6B4C]/20 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#0F6B4C] mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
              </span>
              <span>Emergency Legal Assistance Desk</span>
            </div>

            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#1A1A1A] tracking-tight leading-snug">
              Facing FBR Notice or Legal Emergency?
            </h2>

            <p className="text-xs sm:text-sm text-[#5A6275] mt-2 font-normal leading-relaxed">
              Immediate representation before FBR, District Courts, Appellate Tribunals &amp; High Courts. Select your situation below for direct High Court Advocate assistance.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={scrollPrev}
              aria-label="Previous question slide"
              className="p-2.5 rounded-2xl border border-gray-200 bg-white hover:bg-[#E8F5F0] hover:text-[#0F6B4C] text-[#1A1A1A] shadow-xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next question slide"
              className="p-2.5 rounded-2xl border border-gray-200 bg-white hover:bg-[#E8F5F0] hover:text-[#0F6B4C] text-[#1A1A1A] shadow-xs transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auto-Moving Slides Marquee Container */}
        <div className="relative w-full overflow-hidden group py-2">
          {/* Edge Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#FAFAF7] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAFAF7] to-transparent z-10 pointer-events-none" />

          {/* Moving Track */}
          <div
            ref={containerRef}
            className="flex gap-5 sm:gap-6 animate-marquee-rtl group-hover:[animation-play-state:paused] w-max overflow-x-auto no-scrollbar scroll-smooth"
          >
            {/* Duplicated items (3 sets) for continuous seamless looping */}
            {[...EMERGENCY_QUESTIONS, ...EMERGENCY_QUESTIONS, ...EMERGENCY_QUESTIONS].map((item, idx) => {
              const IconComponent = item.icon;
              const waUrl = buildWhatsAppUrl({
                topic: item.topic,
                customMessage: item.customMessage
              });

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="w-[85vw] sm:w-[350px] md:w-[380px] shrink-0 bg-white rounded-3xl p-6 border border-[#0F6B4C]/20 shadow-xs hover:shadow-md hover:border-[#0F6B4C] transition-all duration-300 flex flex-col justify-between group/card relative"
                >
                  <div>
                    {/* Top Badge & Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-[#E8F5F0] text-[#0F6B4C] font-extrabold text-[11px] px-3 py-1 rounded-full border border-[#0F6B4C]/10">
                        {item.badge}
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-[#0F6B4C]/10 text-[#0F6B4C] flex items-center justify-center group-hover/card:bg-[#0F6B4C] group-hover/card:text-white transition-colors duration-300">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Question Title */}
                    <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A] group-hover/card:text-[#0F6B4C] transition-colors mb-2 leading-snug">
                      {item.question}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-[#5A6275] leading-relaxed mb-6 font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-4 border-t border-gray-100">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-heading font-extrabold text-xs py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group-hover/card:scale-[1.02]"
                    >
                      <MessageCircle className="w-4 h-4 fill-[#1A1A1A]" />
                      <span>{item.buttonLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
