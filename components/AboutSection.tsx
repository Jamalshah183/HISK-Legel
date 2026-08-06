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
  Briefcase,
  Eye,
  Scale,
  FileCheck,
  Building2,
  Gavel,
  TrendingUp
} from 'lucide-react';
import { ATTORNEYS, FIRM_METRICS, Attorney } from '@/data/lawFirmData';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import ceoPortrait from '@/src/assets/images/ceo_kayani_portrait_1784780278642.jpg';

export const AboutSection: React.FC = () => {
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
      className="scroll-mt-20 sm:scroll-mt-24 py-10 sm:py-14 lg:py-16 bg-[#FAFAF7] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#E8F5F0] border border-[#0F6B4C]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#0F6B4C] mb-4">
            <Shield className="w-4 h-4 text-[#F5A623]" />
            <span>High Court Advocates &amp; Legal Leadership</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mb-4">
            About HISK LEGAL
          </h2>
          <p className="text-base sm:text-lg text-[#5A6275] leading-relaxed font-normal">
            Premier full-service law firm in Pakistan led by Founder &amp; CEO Hafiz Irfan Shabber Kayani, Advocate High Court. Dedicated to providing strategic, commercially focused, and results-oriented legal defense.
          </p>
        </motion.div>

        {/* Core Practice Foundations Grid (No Logo) */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#0F6B4C]/15 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5F0] text-[#0F6B4C] flex items-center justify-center mb-5">
                <Scale className="w-6 h-6 text-[#0F6B4C]" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#1A1A1A] mb-2">
                High Court &amp; Appellate Litigation
              </h3>
              <p className="text-sm text-[#5A6275] leading-relaxed font-normal">
                Extensive litigation practice before Islamabad High Court, Lahore High Court, Appellate Tribunals, and administrative forums with a proven record of stay orders and writ petitions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-[#0F6B4C]">
              <span>Islamabad &amp; Regional High Courts</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#0F6B4C]/15 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5F0] text-[#0F6B4C] flex items-center justify-center mb-5">
                <FileCheck className="w-6 h-6 text-[#0F6B4C]" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#1A1A1A] mb-2">
                FBR Tax &amp; Regulatory Defense
              </h3>
              <p className="text-sm text-[#5A6275] leading-relaxed font-normal">
                Specialized advocacy against high-value FBR audit demands, Section 122 reassessments, Section 140 bank attachments, and complex corporate tax compliance.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-[#0F6B4C]">
              <span>Federal Board of Revenue (FBR)</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#0F6B4C]/15 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5F0] text-[#0F6B4C] flex items-center justify-center mb-5">
                <Lock className="w-6 h-6 text-[#0F6B4C]" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#1A1A1A] mb-2">
                100% Statutory Confidentiality
              </h3>
              <p className="text-sm text-[#5A6275] leading-relaxed font-normal">
                Protected by statutory attorney-client privilege, ensuring your financial records, litigation strategy, and corporate discussions remain strictly confidential.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-[#0F6B4C]">
              <span>Legal Privilege Guaranteed</span>
            </div>
          </motion.div>
        </div>

        {/* Quantifiable Relief & Firm Metrics Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="bg-[#0F6B4C] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl mb-12 sm:mb-16 relative overflow-hidden border border-[#0F6B4C]/30"
        >
          {/* Subtle Decorative Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#0A4B35] text-[#F5A623] text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-[#F5A623]/30 shadow-xs">
                <Award className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="uppercase tracking-wider">Track Record of Success</span>
              </div>

              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                Quantifiable Legal Relief &amp; Representation
              </h3>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                Protecting business assets, resolving high-stakes disputes, and securing tax relief before judicial and administrative authorities.
              </p>
            </div>

            {/* Right Metric Cards Column */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 w-full">
              <div className="bg-[#0A4B35]/90 hover:bg-[#0A4B35] p-4 sm:p-5 rounded-2xl border border-emerald-400/20 text-center flex flex-col justify-center items-center shadow-sm transition-all duration-300 min-h-[110px] sm:min-h-[120px]">
                <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#F5A623] tracking-tight">
                  {FIRM_METRICS.totalTaxSaved}
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-1.5 leading-tight">
                  Tax Saved &amp; Protected
                </div>
              </div>

              <div className="bg-[#0A4B35]/90 hover:bg-[#0A4B35] p-4 sm:p-5 rounded-2xl border border-emerald-400/20 text-center flex flex-col justify-center items-center shadow-sm transition-all duration-300 min-h-[110px] sm:min-h-[120px]">
                <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  {FIRM_METRICS.auditReliefRate}
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-1.5 leading-tight">
                  Litigation Success Rate
                </div>
              </div>

              <div className="bg-[#0A4B35]/90 hover:bg-[#0A4B35] p-4 sm:p-5 rounded-2xl border border-emerald-400/20 text-center flex flex-col justify-center items-center shadow-sm transition-all duration-300 min-h-[110px] sm:min-h-[120px]">
                <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#F5A623] tracking-tight">
                  {FIRM_METRICS.casesHandled}
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-1.5 leading-tight">
                  Cases &amp; Writs Handled
                </div>
              </div>

              <div className="bg-[#0A4B35]/90 hover:bg-[#0A4B35] p-4 sm:p-5 rounded-2xl border border-emerald-400/20 text-center flex flex-col justify-center items-center shadow-sm transition-all duration-300 min-h-[110px] sm:min-h-[120px]">
                <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  {FIRM_METRICS.yearsInPractice}
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-1.5 leading-tight">
                  Years Legal Experience
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Why Clients Trust Us - Two Column Feature Layout */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-5"
          >
            <div className="inline-flex items-center gap-1.5 bg-[#0F6B4C]/10 text-[#0F6B4C] px-3.5 py-1 rounded-full text-xs font-bold">
              <Building2 className="w-4 h-4 text-[#0F6B4C]" />
              <span>Commercial &amp; High Court Expertise</span>
            </div>

            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1A1A1A] leading-tight">
              Why Corporate Clients &amp; Individuals Trust HISK LEGAL
            </h3>

            <p className="text-sm sm:text-base text-[#5A6275] leading-relaxed font-normal">
              Under the leadership of Advocate Hafiz Irfan Shabber Kayani, HISK LEGAL combines rigorous statutory analysis with proactive courtroom advocacy. Our practice encompasses Civil, Criminal, Corporate, Banking, Property, and Tax law.
            </p>

            <p className="text-sm sm:text-base text-[#5A6275] leading-relaxed font-normal">
              We understand the urgency of legal proceedings. From filing emergency stay petitions against administrative actions to drafting complex corporate agreements, our advocates ensure clear communication and relentless representation.
            </p>

            <div className="pt-2">
              <a
                href={buildWhatsAppUrl({
                  customMessage: 'Assalamu Alaikum, I would like to schedule a confidential consultation with HISK LEGAL advocates.'
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#0F6B4C] hover:bg-[#0A4B35] text-white font-heading font-bold text-xs sm:text-sm py-3.5 px-6 rounded-xl transition-all shadow-md"
              >
                <MessageCircle className="w-4.5 h-4.5 text-[#F5A623]" />
                <span>Schedule Advocate Consultation</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="bg-white p-5 rounded-2xl border border-[#0F6B4C]/15 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#E8F5F0] text-[#0F6B4C] shrink-0 mt-0.5">
                <Gavel className="w-5 h-5 text-[#0F6B4C]" />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-base text-[#1A1A1A]">
                  High Court Writs &amp; Emergency Stays
                </h4>
                <p className="text-xs sm:text-sm text-[#5A6275] mt-1 leading-relaxed">
                  Rapid judicial petitions before High Courts to halt illegal tax recoveries, bank attachments, or unauthorized administrative actions.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#0F6B4C]/15 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#E8F5F0] text-[#0F6B4C] shrink-0 mt-0.5">
                <GraduationCap className="w-5 h-5 text-[#0F6B4C]" />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-base text-[#1A1A1A]">
                  Appellate Advocacy &amp; Rebuttals
                </h4>
                <p className="text-xs sm:text-sm text-[#5A6275] mt-1 leading-relaxed">
                  Meticulous drafting of legal grounds, appeals, and representations before Commissioner Appeals (CIR) and Appellate Tribunals (ATIR).
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#0F6B4C]/15 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#E8F5F0] text-[#0F6B4C] shrink-0 mt-0.5">
                <TrendingUp className="w-5 h-5 text-[#0F6B4C]" />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-base text-[#1A1A1A]">
                  Corporate Structuring &amp; SECP Advisory
                </h4>
                <p className="text-xs sm:text-sm text-[#5A6275] mt-1 leading-relaxed">
                  Full corporate lifecycle counsel including company incorporation, joint ventures, shareholder agreements, and regulatory filings.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Senior Attorney Roster - Clean Image Cards Gallery */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <div className="inline-flex items-center gap-1.5 bg-[#F5A623]/15 text-[#B87B00] px-3.5 py-1 rounded-full text-xs font-extrabold mb-3">
              <UserCheck className="w-4 h-4 text-[#F5A623]" />
              <span>Firm Leadership &amp; Senior Advocates</span>
            </div>
            <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1A1A1A]">
              Our Senior Legal Advocates
            </h3>
            <p className="text-base text-[#5A6275] mt-2">
              Click on any advocate&apos;s photo card to reveal their full profile, credentials, and practice details.
            </p>
          </motion.div>

          {/* Partner Image Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ATTORNEYS.map((attorney, idx) => {
              const imageSrc = attorneyImages[attorney.id] || attorney.image;
              const isCeo = attorney.isCeo;

              return (
                <motion.div
                  key={attorney.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() => setSelectedAttorney(attorney)}
                  className={`group relative h-[420px] rounded-3xl overflow-hidden border shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-end bg-slate-900 ${
                    isCeo
                      ? 'border-[#0F6B4C]/40 ring-2 ring-[#0F6B4C]/25'
                      : 'border-[#0F6B4C]/15 hover:border-[#0F6B4C]/50'
                  }`}
                >
                  {/* Background Portrait Image */}
                  <Image
                    src={imageSrc}
                    alt={attorney.name}
                    fill
                    unoptimized
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
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
                  <div className="absolute inset-0 bg-[#0F6B4C]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-xs text-[#0F6B4C] font-extrabold text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="w-4 h-4 text-[#F5A623]" />
                      <span>Click to Reveal Full Details</span>
                    </div>
                  </div>

                  {/* Bottom Dark Gradient Footer (Name & Title + Action) */}
                  <div className="relative z-20 p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-white space-y-2">
                    <div className="text-[11px] text-[#F5A623] font-extrabold uppercase tracking-wider">
                      {isCeo ? 'Founder & Chief Executive Officer' : 'Associate Counsel'}
                    </div>
                    <h4 className="font-heading font-extrabold text-lg sm:text-xl text-white leading-tight group-hover:text-[#F5A623] transition-colors">
                      {attorney.name}
                    </h4>
                    <p className="text-xs text-gray-300 line-clamp-1 font-medium">
                      {attorney.title}
                    </p>

                    <div className="pt-2">
                      <div className="w-full bg-[#0F6B4C] group-hover:bg-[#0A4B35] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                        <span>Click to Reveal Details</span>
                        <ChevronRight className="w-4 h-4 text-[#F5A623]" />
                      </div>
                    </div>
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
