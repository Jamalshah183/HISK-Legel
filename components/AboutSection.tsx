'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  GraduationCap,
  MessageCircle,
  ChevronRight,
  X,
  Award,
  CheckCircle2,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { ATTORNEYS, FIRM_METRICS, Attorney } from '@/data/lawFirmData';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import ceoPortrait from '@/src/assets/images/ceo_kayani_portrait_1784780278642.jpg';

export const AboutSection: React.FC = () => {
  const [imgSrc, setImgSrc] = useState('https://i.ibb.co/V02sjKtY/file-00000000549882089b03c95577e607a2.png');
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | null>(null);
  const [attorneyImages, setAttorneyImages] = useState<Record<string, string>>({});

  const handleImageError = (attorneyId: string, currentSrc: string) => {
    if (attorneyId === 'hafiz-irfan-shabber-kayani') {
      if (!currentSrc.includes('ceo_kayani_portrait')) {
        setAttorneyImages((prev) => ({ ...prev, [attorneyId]: ceoPortrait.src }));
      }
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      id="about"
      className="py-24 sm:py-32 lg:py-40 bg-[#FAFAF7] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#E8F5F0] border border-[#0F6B4C]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#0F6B4C] mb-4">
            <Shield className="w-4 h-4 text-[#F5A623]" />
            <span>High Court Advocates &amp; Legal Leadership</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mb-4">
            About HISK LEGAL
          </h2>
          <p className="text-base sm:text-lg text-[#5A6275] leading-relaxed font-normal">
            Premier full-service law firm in Pakistan led by Founder &amp; CEO Hafiz Irfan Shabber Kayani, Advocate High Court. Dedicated to providing strategic, commercially focused, and results-oriented legal services.
          </p>
        </motion.div>

        {/* Large Floating Image directly above Why Choose Us */}
        <div className="relative mb-14 sm:mb-20 flex justify-center items-center w-full">
          <div className="absolute w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-[#0F6B4C]/20 to-[#F5A623]/25 blur-3xl -z-10 pointer-events-none" />
          <motion.div
            animate={{ y: [0, -18, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-full max-w-md sm:max-w-xl lg:max-w-2xl h-72 sm:h-96 lg:h-[420px] flex items-center justify-center"
          >
            <Image
              src={imgSrc}
              alt="HISK LEGAL Practice"
              fill
              unoptimized
              className="object-contain object-center drop-shadow-2xl"
              referrerPolicy="no-referrer"
              onError={() => {
                if (!imgSrc.includes('file-00000000549882089b03c95577e607a2')) {
                  setImgSrc('https://i.ibb.co/V02sjKtY/file-00000000549882089b03c95577e607a2.png');
                }
              }}
            />
          </motion.div>
        </div>

        {/* Story & Metrics Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-20 items-stretch">
          {/* Column 1: Why Choose Us */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F6B4C]">
                Why Clients &amp; Businesses Trust HISK LEGAL
              </h3>
              <p className="text-base text-[#1A1A1A] leading-relaxed font-normal">
                Under the leadership of Advocate Hafiz Irfan Shabber Kayani, HISK LEGAL delivers technical legal excellence across Civil, Criminal, Corporate, Banking, Property, Taxation, and International matters.
              </p>
              <p className="text-[#5A6275] text-sm sm:text-base leading-relaxed font-normal">
                Our advocates regularly represent individuals, financial institutions, and corporate entities before High Courts, tribunals, and administrative bodies throughout Pakistan, ensuring meticulous legal drafting and strategic advocacy.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3.5 bg-white p-4.5 rounded-2xl border border-[#0F6B4C]/15 shadow-xs">
                <Lock className="w-5 h-5 text-[#0F6B4C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-[#1A1A1A]">100% Attorney-Client Confidentiality</div>
                  <div className="text-xs sm:text-sm text-[#5A6275]">Uncompromising ethics, confidentiality, and professional standards.</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white p-4.5 rounded-2xl border border-[#0F6B4C]/15 shadow-xs">
                <GraduationCap className="w-5 h-5 text-[#0F6B4C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-[#1A1A1A]">High Court Practice &amp; Strategic Advocacy</div>
                  <div className="text-xs sm:text-sm text-[#5A6275]">Tailored legal strategies for contentious litigation and regulatory compliance.</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Metrics Highlight Card */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 bg-[#0F6B4C] text-[#FAFAF7] rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#F5A623]">
                  Full-Service Legal Excellence
                </span>
                <h4 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
                  Quantifiable Legal Relief
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
                <div className="bg-[#0A4B35] p-4 sm:p-5 rounded-2xl border border-emerald-600/30">
                  <div className="font-heading font-extrabold text-xl sm:text-3xl text-[#F5A623]">
                    {FIRM_METRICS.totalTaxSaved}
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
                    Client Value Protected &amp; Saved
                  </div>
                </div>

                <div className="bg-[#0A4B35] p-4 sm:p-5 rounded-2xl border border-emerald-600/30">
                  <div className="font-heading font-extrabold text-xl sm:text-3xl text-white">
                    {FIRM_METRICS.auditReliefRate}
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
                    Litigation &amp; Relief Success Rate
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Senior Attorney Roster */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-1.5 bg-[#F5A623]/15 text-[#B87B00] px-3.5 py-1 rounded-full text-xs font-extrabold mb-3">
              <UserCheck className="w-4 h-4 text-[#F5A623]" />
              <span>Firm Leadership &amp; Senior Advocates</span>
            </div>
            <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A1A]">
              Our Senior Legal Advocates
            </h3>
            <p className="text-base text-[#5A6275] mt-2">
              Meet our founder and legal team dedicated to technical excellence and client success.
            </p>
          </motion.div>

          {/* Swipe Indicator for Mobile */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#0F6B4C] bg-[#0F6B4C]/10 px-3.5 py-1.5 rounded-full w-fit mx-auto mb-5 md:hidden">
            <span>Swipe right to see more</span>
            <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
          </div>

          <div className="-mx-4 px-8 scroll-pl-8 sm:-mx-6 sm:px-6 sm:scroll-pl-6 md:mx-0 md:px-0 md:scroll-pl-0 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] md:w-full overflow-x-auto no-scrollbar py-3 touch-auto flex gap-4 sm:gap-6 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-8 md:overflow-visible">
            {ATTORNEYS.map((attorney, idx) => {
              const imageSrc = attorneyImages[attorney.id] || attorney.image;
              const isCeo = attorney.isCeo;

              return (
                <motion.div
                  key={attorney.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className={`w-[82vw] max-w-[340px] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-start rounded-3xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
                    isCeo
                      ? 'bg-gradient-to-b from-[#F2F9F5] via-white to-white border-[#0F6B4C]/35 ring-1 ring-[#0F6B4C]/20'
                      : 'bg-white border-[#0F6B4C]/15'
                  }`}
                >
                  <div>
                    {/* Header Image */}
                    <div className="relative h-60 sm:h-64 md:h-60 lg:h-64 w-full bg-[#0F6B4C]/5 overflow-hidden">
                      {isCeo && (
                        <div className="absolute top-3 left-3 z-10 bg-[#0F6B4C] text-[#F5A623] text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#F5A623]" />
                          <span>FOUNDER &amp; CEO</span>
                        </div>
                      )}
                      <Image
                        src={imageSrc}
                        alt={attorney.name}
                        fill
                        unoptimized
                        className="object-cover object-top hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(attorney.id, imageSrc)}
                      />
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {attorney.credentials.map((cred, cIdx) => (
                          <span
                            key={cIdx}
                            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md ${
                              isCeo
                                ? 'bg-[#0F6B4C] text-white'
                                : 'bg-[#E8F5F0] text-[#0F6B4C]'
                            }`}
                          >
                            {cred}
                          </span>
                        ))}
                      </div>

                      <h4 className="font-heading font-extrabold text-lg sm:text-xl text-[#1A1A1A] leading-snug">
                        {attorney.name}
                      </h4>
                      <div className="text-xs text-[#0F6B4C] font-bold leading-tight">{attorney.title}</div>

                      <p className="text-xs text-[#5A6275] leading-relaxed font-normal line-clamp-3">
                        {attorney.bio}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-2.5">
                    {attorney.fullBio && (
                      <button
                        onClick={() => setSelectedAttorney(attorney)}
                        className="w-full bg-[#E8F5F0] hover:bg-[#0F6B4C]/15 text-[#0F6B4C] font-heading font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-[#0F6B4C]/20"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Read Full Profile &amp; Practice</span>
                      </button>
                    )}

                    <a
                      href={buildWhatsAppUrl({
                        customMessage: `Assalamu Alaikum Advocate ${attorney.name}, I would like to consult with you directly regarding a legal matter for HISK LEGAL.`
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#0F6B4C] hover:bg-[#0A4B35] text-white font-heading font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 text-[#F5A623]" />
                      <span>WhatsApp Consultation</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
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

