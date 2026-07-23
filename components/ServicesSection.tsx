'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Building2,
  Gavel,
  Home as HomeIcon,
  Users,
  Shield,
  Scroll,
  MessageCircle,
  Sparkles,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  subServices: string[];
  keyHighlights: string[];
  iconName: string;
  badge?: string;
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'taxation-fbr-advisory',
    title: 'Taxation & FBR Legal Defense',
    category: 'Tax & Finance',
    shortDesc: 'Complete direct & indirect tax legal counsel, FBR notice & audit defense, bookkeeping, and High Court tax litigation.',
    fullDesc: 'End-to-end tax legal counsel for corporate entities and high earners across Pakistan. We handle income tax, sales tax (FBR, PRA, SRB, KPRA, BRA), withholding audits, international tax treaties, tax-compliant bookkeeping, and appellate tribunal representation before CIR-A, ATIR, and High Courts.',
    subServices: [
      'Direct & Indirect Taxation',
      'FBR Notice & Audit Defense',
      'High Court Tax Litigation',
      'Bookkeeping & Financial Reporting'
    ],
    keyHighlights: [
      'Income Tax & Sales Tax Return Filing & Audit Defense',
      'Tax Planning, Structuring & Exemption Certificates',
      'High Court Tax Writs & Appellate Tribunal Appeals',
      'Computerized Ledger Maintenance & Tax-Compliant Reporting'
    ],
    iconName: 'FileText',
    badge: 'Core Specialty'
  },
  {
    id: 'corporate-secp-advisory',
    title: 'Corporate, SECP & Business Advisory',
    category: 'Corporate & Business',
    shortDesc: 'SECP company formation, annual statutory compliance, HR consultancy, M&A transactions, and business strategy.',
    fullDesc: 'Comprehensive corporate law advisory for startups, SMEs, and multinational enterprises. We handle company incorporation (Private Limited, SMC, LLP) with SECP, joint ventures, shareholder agreements, labor law/HR compliance, M&A transaction advisory, and company liquidation.',
    subServices: [
      'Company Formation & SECP Compliance',
      'Human Resource & Labor Consultancy',
      'M&A & Transaction Advisory',
      'Corporate Liquidation & Exit'
    ],
    keyHighlights: [
      'SECP Company Incorporation & Statutory Filings (Form A/29)',
      'Mergers & Acquisitions (M&A) & Venture Capital Deals',
      'Employment Contracts, Labor Law & EOBI/PESSI Compliance',
      'Corporate Restructuring & Winding-Up / Exit Advisory'
    ],
    iconName: 'Building2',
    badge: 'Corporate'
  },
  {
    id: 'litigation-arbitration-white-collar',
    title: 'Litigation, Arbitration & Accountability',
    category: 'Litigation & Disputes',
    shortDesc: 'Civil & commercial litigation, domestic/international arbitration, NAB/FIA white-collar crime defense, and banking recovery.',
    fullDesc: 'Aggressive trial advocacy and dispute resolution before District Courts, Banking Courts, Special Tribunals, and High Courts. We specialize in commercial arbitration (ADR), defense in white-collar criminal investigations (NAB/FIA), and corporate banking debt recovery suits.',
    subServices: [
      'Civil & Commercial Litigation',
      'Commercial Arbitration & ADR',
      'White-Collar Crime (NAB & FIA)',
      'Banking Court Recovery Defense'
    ],
    keyHighlights: [
      'High Court Civil & Commercial Suits & Appeals',
      'Domestic & International Commercial Arbitration (ADR)',
      'White-Collar Crime & Accountability Trial Defense (NAB / FIA)',
      'Banking Court Recovery Suits & Loan Restructuring'
    ],
    iconName: 'Gavel',
    badge: 'High Court & Trial'
  },
  {
    id: 'property-real-estate-construction',
    title: 'Property, Real Estate & Construction Law',
    category: 'Property & Real Estate',
    shortDesc: 'Property title verification, Section 7E tax clearances, rent controller disputes, and construction/FIDIC contracts.',
    fullDesc: 'Protecting real estate investments and developer projects across Pakistan. We manage title search reports, sale deed registration, Section 7E tax exemption certificates, landlord-tenant rent controller litigation, and Pakistan Engineering Council (PEC) / FIDIC construction contracts.',
    subServices: [
      'Property Title Search & Due Diligence',
      'Rent Controller Eviction Suits',
      'FBR Section 7E Exemption Certificates',
      'Construction Contracts & FIDIC Arbitration'
    ],
    keyHighlights: [
      'Property Title Verification, Registry & Power of Attorney Drafting',
      'FBR Section 7E Deemed Income Tax Exemption Clearance',
      'Commercial Lease Agreements & Rent Controller Eviction Suits',
      'FIDIC Construction Contracts, PEC Permits & Delay Claims'
    ],
    iconName: 'Home',
    badge: 'Real Estate'
  },
  {
    id: 'constitutional-public-law',
    title: 'Constitutional & Public Law',
    category: 'Litigation & Disputes',
    shortDesc: 'High Court constitutional writ petitions (Article 199), challenging unlawful SROs, and public procurement disputes.',
    fullDesc: 'Defending fundamental constitutional rights and challenging arbitrary executive actions, illegal tax SROs, or statutory overreach under Article 199 before the High Courts of Pakistan. Also covers public tenders under PPRA rules.',
    subServices: [
      'High Court Writ Petitions (Art. 199)',
      'Challenging Unlawful SROs & Circulars',
      'Public Procurement (PPRA) Disputes',
      'Administrative Injunctions & Stays'
    ],
    keyHighlights: [
      'High Court Constitutional Writ Petitions under Article 199',
      'Challenging Unlawful FBR SROs, Circulars & Excess of Authority',
      'Public Procurement (PPRA) & Government Tender Disputes',
      'Stay Orders Against Arbitrary Executive Enforcement'
    ],
    iconName: 'Scroll',
    badge: 'High Court'
  },
  {
    id: 'cyber-ip-tech-law',
    title: 'Cyber, Intellectual Property & Tech Law',
    category: 'Specialized Law',
    shortDesc: 'FIA Cyber Crime Wing defense (PECA 2016), IPO trademark & patent registration, and e-commerce compliance.',
    fullDesc: 'Specialized legal protection for technology firms, digital enterprises, and brand owners. We represent clients before the FIA Cyber Crime Wing, register trademarks and patents with IPO Pakistan, handle copyright protection, and structure software licensing agreements.',
    subServices: [
      'FIA Cyber Crime (PECA 2016) Defense',
      'IPO Trademark & Patent Registration',
      'Copyright & Brand Infringement',
      'Data Privacy & E-Commerce Law'
    ],
    keyHighlights: [
      'FIA Cyber Crime Wing Inquiries & Trial Defense under PECA 2016',
      'Trademark, Logo & Patent Registration with IPO Pakistan',
      'Data Privacy, Software Licensing & E-Commerce Compliance',
      'IP Infringement Notice Issuance & Enforcement Litigation'
    ],
    iconName: 'Shield',
    badge: 'Tech & IP'
  },
  {
    id: 'family-estate-inheritance-law',
    title: 'Family, Estate & Succession Law',
    category: 'Specialized Law',
    shortDesc: 'Succession certificates from High Court/Nadra, Islamic inheritance asset division, gift deeds, and family court representation.',
    fullDesc: 'Confidential, sensitive, and legally sound estate and family law representation. We secure Letters of Administration and Succession Certificates, calculate Islamic inheritance distribution, draft gift deeds, and handle family court proceedings.',
    subServices: [
      'Succession Certificates (Nadra/Court)',
      'Islamic Inheritance Asset Division',
      'Family Gift Deeds & Settlements',
      'Family Court & Custody Litigation'
    ],
    keyHighlights: [
      'Succession Certificates & Letters of Administration',
      'Islamic Inheritance Asset Calculation & Partition Deeds',
      'Family Gift Deeds, Trust Formations & Asset Protection',
      'Child Custody, Guardianship & Family Court Representation'
    ],
    iconName: 'Users',
    badge: 'Personal Law'
  }
];

export const ServicesSection: React.FC = () => {
  const [modalService, setModalService] = useState<ServiceItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper to render icon with text-current so group-hover transition works smoothly
  const getServiceIcon = (iconName: string) => {
    const iconClass = "w-6 h-6 text-current transition-colors duration-300";
    switch (iconName) {
      case 'FileText':
        return <FileText className={iconClass} />;
      case 'Building2':
        return <Building2 className={iconClass} />;
      case 'Gavel':
        return <Gavel className={iconClass} />;
      case 'Home':
        return <HomeIcon className={iconClass} />;
      case 'Scroll':
        return <Scroll className={iconClass} />;
      case 'Shield':
        return <Shield className={iconClass} />;
      case 'Users':
      default:
        return <Users className={iconClass} />;
    }
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      id="services"
      className="py-16 sm:py-24 lg:py-32 bg-[#FAFAF7] border-y border-gray-200/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#E8F5F0] border border-[#0F6B4C]/20 px-4 py-1.5 rounded-full text-xs font-extrabold text-[#0F6B4C] mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#0F6B4C]" />
              <span>Full-Spectrum Practice Pillars</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mb-3">
              Major Practice Services
            </h2>
            <p className="text-sm sm:text-base text-[#5A6275] font-normal leading-relaxed">
              High Court advocates and financial consultants delivering strategic, privileged legal defense and corporate advisory across Pakistan.
            </p>
          </motion.div>

          {/* Navigation Arrows for Horizontal Swiping / Scrolling */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center gap-3 shrink-0 self-start md:self-end"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F6B4C] bg-[#0F6B4C]/10 px-3.5 py-1.5 rounded-full">
              <span>Swipe right to see more</span>
              <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <button
              onClick={() => handleManualScroll('left')}
              id="scroll-services-left-btn"
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full bg-white border border-[#0F6B4C]/20 shadow-xs hover:bg-[#0F6B4C] hover:text-white text-[#0F6B4C] flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleManualScroll('right')}
              id="scroll-services-right-btn"
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full bg-white border border-[#0F6B4C]/20 shadow-xs hover:bg-[#0F6B4C] hover:text-white text-[#0F6B4C] flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Horizontal Line of Cards (7 Major Unique Services, No Duplicates, No Auto-Scroll) */}
        <div
          ref={scrollRef}
          className="-mx-4 px-8 scroll-pl-8 sm:-mx-6 sm:px-6 sm:scroll-pl-6 lg:-mx-8 lg:px-8 lg:scroll-pl-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] overflow-x-auto no-scrollbar py-3 touch-auto flex gap-4 sm:gap-6 snap-x snap-mandatory"
        >
          {SERVICES_DATA.map((service, idx) => (
            <motion.div
              key={service.id}
              id={`service-card-${service.id}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="w-[82vw] max-w-[340px] sm:w-[320px] md:w-[350px] lg:w-[380px] shrink-0 bg-white rounded-2xl p-5 sm:p-7 border border-[#0F6B4C]/15 shadow-xs hover:shadow-lg transition-shadow duration-300 hover:border-[#0F6B4C]/50 flex flex-col justify-between group cursor-pointer snap-start"
              onClick={() => setModalService(service)}
            >
              <div>
                {/* Top Bar with Icon & Badge */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F5F0] text-[#0F6B4C] group-hover:bg-[#0F6B4C] group-hover:text-white transition-all duration-300 flex items-center justify-center shrink-0 shadow-xs">
                    {getServiceIcon(service.iconName)}
                  </div>
                  {service.badge && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#F5A623]/20 text-[#1A1A1A] border border-[#F5A623]/40 px-2.5 py-1 rounded-md">
                      {service.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#1A1A1A] group-hover:text-[#0F6B4C] transition-colors duration-300 mb-2.5">
                  {service.title}
                </h3>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-[#5A6275] font-normal leading-relaxed line-clamp-2 mb-4">
                  {service.shortDesc}
                </p>

                {/* Sub-Services Tags */}
                <div className="mb-4">
                  <span className="text-[10px] font-extrabold text-[#0F6B4C] uppercase tracking-wider block mb-2">
                    Key Practice Sub-Services:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {service.subServices.map((sub, idx) => (
                      <span
                        key={idx}
                        className="bg-[#FAFAF7] border border-gray-200/80 text-[#1A1A1A] text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Action */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#0F6B4C]">
                <span>View Full Practice Coverage</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Detail for Service Click */}
      {modalService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setModalService(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-[#0F6B4C]/20 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalService(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-full bg-gray-100 text-[#1A1A1A] hover:bg-gray-200"
              id="close-service-modal-btn"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3 sm:mb-4 pr-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0F6B4C] text-white flex items-center justify-center shrink-0">
                {getServiceIcon(modalService.iconName)}
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg sm:text-2xl text-[#1A1A1A]">
                  {modalService.title}
                </h3>
                <span className="text-[11px] sm:text-xs font-bold text-[#0F6B4C] bg-[#E8F5F0] px-2 py-0.5 rounded-full inline-block mt-0.5">
                  {modalService.category}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5A6275] leading-relaxed mb-3 sm:mb-4 font-normal">
              {modalService.fullDesc}
            </p>

            <div className="mb-3 sm:mb-4">
              <span className="text-[10px] sm:text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider block mb-1.5">
                Sub-Services Included:
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {modalService.subServices.map((sub, idx) => (
                  <span
                    key={idx}
                    className="bg-[#E8F5F0] text-[#0F6B4C] font-semibold text-[11px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
              <span className="text-[10px] sm:text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider block mb-1">
                Detailed Service Capabilities:
              </span>
              {modalService.keyHighlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-[#1A1A1A]">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F6B4C] shrink-0 mt-0.5" />
                  <span className="leading-tight">{highlight}</span>
                </div>
              ))}
            </div>

            <a
              href={buildWhatsAppUrl({
                topic: 'practice_area',
                practiceArea: modalService.title
              })}
              target="_blank"
              rel="noopener noreferrer"
              id="modal-service-whatsapp-btn"
              className="w-full bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-heading font-extrabold text-xs sm:text-sm py-3 px-4 sm:py-3.5 sm:px-6 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-center"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-[#1A1A1A]" />
              <span>Book Direct Advocate Consultation</span>
            </a>
          </div>
        </div>
      )}
    </motion.section>
  );
};
