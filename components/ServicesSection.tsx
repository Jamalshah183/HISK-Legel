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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const scrollRef = useRef<HTMLDivElement>(null);

  const CATEGORIES = ['All', 'Tax & Finance', 'Corporate & Business', 'Litigation & Disputes', 'Property & Real Estate', 'Specialized Law'];

  const filteredServices = selectedCategory === 'All'
    ? SERVICES_DATA
    : SERVICES_DATA.filter(service => service.category === selectedCategory);

  const displayServices = filteredServices.length < 4
    ? [...filteredServices, ...filteredServices, ...filteredServices, ...filteredServices]
    : [...filteredServices, ...filteredServices];

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
      className="scroll-mt-20 sm:scroll-mt-24 py-10 sm:py-14 lg:py-16 bg-[#FAFAF7] border-y border-gray-200/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        {/* Section Header */}
        <div className="w-full flex flex-col items-center justify-center text-center gap-4 mb-6 sm:mb-8 border-b border-[#0F6B4C]/15 pb-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center"
          >
            <h2 className="w-full font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mb-3 text-center mx-auto">
              Major Practice Areas
            </h2>
            <p className="w-full text-sm sm:text-base text-[#5A6275] font-normal leading-relaxed mb-4 text-center max-w-2xl mx-auto">
              From complex litigation to corporate advisory our advocates provide practical legal solutions tailored to individuals, businesses and institutions.
            </p>

            {/* Category Filter Buttons */}
            <div className="w-full flex flex-wrap items-center justify-center text-center gap-2 pt-2 mx-auto">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    type="button"
                    id={`category-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 border cursor-pointer ${
                      isActive
                        ? 'bg-[#0F6B4C] text-white border-[#0F6B4C] shadow-sm scale-105'
                        : 'bg-white text-[#5A6275] border-gray-200 hover:border-[#0F6B4C]/50 hover:text-[#0F6B4C]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Continuous Auto-Moving Track of Cards (Left to Right) */}
        <div className="w-full relative overflow-hidden py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex justify-center items-center">
          {/* Subtle Left & Right Edge Vignette Shadows */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#FAFAF7] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAFAF7] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-ltr flex gap-4 sm:gap-6 w-max py-2">
            {displayServices.map((service, idx) => (
              <div
                key={`${service.id}-${idx}`}
                id={`service-card-${service.id}-${idx}`}
                className="w-[82vw] max-w-[340px] sm:w-[320px] md:w-[350px] lg:w-[380px] shrink-0 bg-white rounded-2xl p-5 sm:p-7 border border-[#0F6B4C]/15 shadow-xs hover:shadow-lg transition-all duration-300 hover:border-[#0F6B4C]/50 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer"
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
                      {service.subServices.map((sub, sIdx) => (
                        <span
                          key={sIdx}
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
              </div>
            ))}
          </div>
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
