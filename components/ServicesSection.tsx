'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Scale,
  Landmark,
  Briefcase
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { usePortalStore } from '@/lib/portalStore';
import { PracticeArea } from '@/types/portal';

export type ServiceItem = PracticeArea;

// Dedicated Core Practice Areas curated into the 3 requested categories:
// 1. 'Litigation & Disputes'
// 2. 'Corporate and Advisory'
// 3. 'Tax and Compliance'
export const CORE_PRACTICE_SERVICES: ServiceItem[] = [
  // ==================== LITIGATION & DISPUTES ====================
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
    badge: 'High Court Writs'
  },
  {
    id: 'property-civil-disputes',
    title: 'Civil, Property & Succession Disputes',
    category: 'Litigation & Disputes',
    shortDesc: 'Land title verification, rent controller eviction suits, High Court succession certificates, and inheritance partition trials.',
    fullDesc: 'Expert trial and appellate advocacy in property and inheritance disputes. We represent landlords and tenants in rent controller proceedings, handle partition suits for family assets, obtain Letters of Administration and Succession Certificates from Nadra/Courts, and defend real estate titles.',
    subServices: [
      'Property Title & Injunction Suits',
      'Rent Controller Eviction Defense',
      'Succession & Inheritance Partition',
      'Family Court & Custody Litigation'
    ],
    keyHighlights: [
      'Civil Injunctions & Land Ownership Title Defense',
      'Commercial Lease Disputes & Eviction Decrees',
      'High Court & Nadra Succession Certificates',
      'Partition Deeds & Inheritance Asset Division'
    ],
    iconName: 'Home',
    badge: 'Dispute Resolution'
  },

  // ==================== CORPORATE AND ADVISORY ====================
  {
    id: 'corporate-secp-advisory',
    title: 'Corporate, SECP & Business Advisory',
    category: 'Corporate and Advisory',
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
    id: 'commercial-contracts-regulatory',
    title: 'Commercial Contracts & Regulatory Advisory',
    category: 'Corporate and Advisory',
    shortDesc: 'Cross-border joint ventures, distribution & agency agreements, corporate governance, and regulatory licensing.',
    fullDesc: 'Structuring airtight commercial contracts, vendor agreements, franchise pacts, and regulatory licensing. We guide corporate boards and founders on regulatory compliance across federal and provincial authorities.',
    subServices: [
      'Commercial Contract Drafting',
      'Cross-Border Joint Ventures',
      'Corporate Governance & Audits',
      'Regulatory Licensing & Approvals'
    ],
    keyHighlights: [
      'Airtight Commercial Agreements & SLA Drafting',
      'Cross-Border Joint Venture & Partnership Structuring',
      'Corporate Governance Policies & Board Advisory',
      'Provincial & Federal Regulatory Compliance Clearances'
    ],
    iconName: 'Briefcase',
    badge: 'Advisory'
  },
  {
    id: 'cyber-ip-tech-law',
    title: 'Intellectual Property, Cyber & Tech Advisory',
    category: 'Corporate and Advisory',
    shortDesc: 'IPO trademark & patent registration, software licensing, FIA Cyber Crime (PECA 2016) defense, and e-commerce compliance.',
    fullDesc: 'Specialized legal protection for technology firms, digital enterprises, and brand owners. We represent clients before the FIA Cyber Crime Wing, register trademarks and patents with IPO Pakistan, handle copyright protection, and structure software licensing agreements.',
    subServices: [
      'IPO Trademark & Patent Registration',
      'Software & SaaS Licensing Agreements',
      'FIA Cyber Crime (PECA 2016) Advisory',
      'Data Privacy & E-Commerce Law'
    ],
    keyHighlights: [
      'Trademark, Logo & Patent Registration with IPO Pakistan',
      'Software Licensing, IP Assignment & Tech Contracts',
      'Data Privacy, E-Commerce & PECA 2016 Compliance',
      'IP Infringement Notice Issuance & Enforcement'
    ],
    iconName: 'Shield',
    badge: 'Tech & IP'
  },

  // ==================== TAX AND COMPLIANCE ====================
  {
    id: 'taxation-fbr-advisory',
    title: 'Taxation & FBR Legal Defense',
    category: 'Tax and Compliance',
    shortDesc: 'Complete direct & indirect tax legal counsel, FBR notice & audit defense, bookkeeping, and High Court tax litigation.',
    fullDesc: 'End-to-end tax legal counsel for corporate entities and high earners across Pakistan. We handle income tax, sales tax (FBR, PRA, SRB, KPRA, BRA), withholding audits, international tax treaties, tax-compliant bookkeeping, and appellate tribunal representation before CIR-A, ATIR, and High Courts.',
    subServices: [
      'Direct & Indirect Taxation',
      'FBR Notice & Audit Defense',
      'Appellate Tribunal (ATIR) Appeals',
      'Tax-Compliant Bookkeeping'
    ],
    keyHighlights: [
      'Income Tax & Sales Tax Return Filing & Audit Defense',
      'Tax Planning, Structuring & Exemption Certificates',
      'Appellate Tribunal (ATIR) & CIR-Appeals Defense',
      'Computerized Ledger Maintenance & Withholding Reconciliation'
    ],
    iconName: 'FileText',
    badge: 'Tax & FBR'
  },
  {
    id: 'high-court-tax-litigation',
    title: 'High Court Tax Litigation & Appeals',
    category: 'Tax and Compliance',
    shortDesc: 'High Court tax writ petitions challenging illegal tax assessments, arbitrary recovery notices, and unconstitutional SRO levies.',
    fullDesc: 'Litigating complex federal and provincial tax controversies before the High Courts of Pakistan and the Supreme Court. We obtain urgent stay orders against arbitrary bank attachments, recovery notices, and unlawful show-cause notices.',
    subServices: [
      'High Court Tax Writ Petitions',
      'Stay Orders Against Bank Attachments',
      'Reference Applications before High Court',
      'Challenging Unlawful SRO Levies'
    ],
    keyHighlights: [
      'Immediate High Court Stay Petitions Against Recovery Notices',
      'Challenging SRO Ultra Vires & Illegal Tax Levies',
      'Tax Reference Appeals (ITRA / STRA) before High Court Division Benches',
      'Restoration of Bank Accounts Attached under Section 140'
    ],
    iconName: 'Scale',
    badge: 'Tax Litigation'
  },
  {
    id: 'fbr-section-7e-regulatory-compliance',
    title: 'FBR Section 7E & Regulatory Tax Compliance',
    category: 'Tax and Compliance',
    shortDesc: 'Section 7E deemed income tax exemption certificates, withholding audits, active taxpayer status (ATL), and sales tax registrations.',
    fullDesc: 'Ensuring seamless regulatory tax compliance for corporations, developers, and individuals. We secure Section 7E tax clearance certificates for property transfers, resolve ATL suspension issues, and ensure multi-provincial sales tax alignment.',
    subServices: [
      'Section 7E Tax Exemption Certificates',
      'Sales Tax (PRA, SRB, KPRA, BRA)',
      'Withholding Agent Audit Compliance',
      'Active Taxpayer List (ATL) Restoration'
    ],
    keyHighlights: [
      'Fast-Track FBR Section 7E Exemption Certificate Issuance',
      'Provincial Sales Tax on Services Compliance (PRA / SRB / KPRA)',
      'Quarterly & Annual Withholding Statement Audits',
      'ATL Blacklisting / Inactive Status Legal Resolution'
    ],
    iconName: 'Landmark',
    badge: 'Compliance'
  }
];

export const SERVICES_DATA: ServiceItem[] = CORE_PRACTICE_SERVICES;

export const ServicesSection: React.FC = () => {
  const { practiceAreas } = usePortalStore();

  // Normalize any store practice areas strictly into the 3 requested categories
  const currentServices = useMemo(() => {
    if (practiceAreas && practiceAreas.length > 0) {
      // Check if custom areas were defined
      const hasCustom = practiceAreas.some(p => p.id && !CORE_PRACTICE_SERVICES.some(c => c.id === p.id));
      if (hasCustom) {
        return practiceAreas.map((p) => {
          const lower = (p.category || '').toLowerCase();
          let targetCategory = 'Corporate and Advisory';
          if (lower.includes('tax') || lower.includes('compliance') || lower.includes('fbr') || lower.includes('finance')) {
            targetCategory = 'Tax and Compliance';
          } else if (lower.includes('litigat') || lower.includes('dispute') || lower.includes('court') || lower.includes('property') || lower.includes('family')) {
            targetCategory = 'Litigation & Disputes';
          }
          return { ...p, category: targetCategory };
        });
      }
    }
    return CORE_PRACTICE_SERVICES;
  }, [practiceAreas]);

  const [modalService, setModalService] = useState<ServiceItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Strictly only the requested categories
  const CATEGORIES = useMemo(() => [
    'All',
    'Litigation & Disputes',
    'Corporate and Advisory',
    'Tax and Compliance'
  ], []);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'All') return currentServices;
    return currentServices.filter(service => service.category === selectedCategory);
  }, [currentServices, selectedCategory]);

  // Helper to render icon with text-current so group-hover transition works smoothly
  const getServiceIcon = (iconName: string) => {
    const iconClass = "w-6 h-6 text-current transition-colors duration-300";
    switch (iconName) {
      case 'FileText':
        return <FileText className={iconClass} />;
      case 'Building2':
      case 'Building':
        return <Building2 className={iconClass} />;
      case 'Gavel':
        return <Gavel className={iconClass} />;
      case 'Home':
        return <HomeIcon className={iconClass} />;
      case 'Scroll':
        return <Scroll className={iconClass} />;
      case 'Shield':
        return <Shield className={iconClass} />;
      case 'Scale':
        return <Scale className={iconClass} />;
      case 'Landmark':
        return <Landmark className={iconClass} />;
      case 'Briefcase':
        return <Briefcase className={iconClass} />;
      case 'Users':
      default:
        return <Users className={iconClass} />;
    }
  };

  const getStepWidth = () => {
    if (!scrollRef.current) return 360;
    const firstCard = scrollRef.current.firstElementChild as HTMLElement | null;
    return firstCard ? firstCard.offsetWidth + 24 : 360;
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const step = getStepWidth();
      if (direction === 'right') {
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
        }
      } else {
        if (scrollLeft <= 20) {
          scrollRef.current.scrollTo({ left: scrollWidth - clientWidth, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: -step, behavior: 'smooth' });
        }
      }
    }
  };

  // Reset scroll when category filter changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  // Fast & fluid auto-advance when not hovered (speed increased from 4.5s to 2s)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const step = getStepWidth();
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [isHovered, selectedCategory]);

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
              Core Practice Areas
            </h2>
            <p className="w-full text-sm sm:text-base text-[#5A6275] font-normal leading-relaxed mb-4 text-center max-w-2xl mx-auto">
              From complex litigation to corporate advisory our advocates provide out of the box practical legal solutions tailored to individuals, businesses and institutions.
            </p>

            {/* Category Filter Buttons - Strictly the 3 Categories */}
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

        {/* Core Practice Areas Carousel with Left and Right Navigation Arrows */}
        <div
          className="w-full relative group py-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Subtle Left & Right Edge Vignette Shadows */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#FAFAF7] via-[#FAFAF7]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAFAF7] via-[#FAFAF7]/80 to-transparent z-10 pointer-events-none" />

          {/* Left Navigation Arrow */}
          <button
            type="button"
            onClick={() => handleManualScroll('left')}
            id="services-carousel-prev-btn"
            aria-label="Previous practice area"
            className="absolute left-1 sm:left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#0F6B4C]/25 text-[#0F6B4C] shadow-lg hover:shadow-xl hover:bg-[#0F6B4C] hover:text-white transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0F6B4C] active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={() => handleManualScroll('right')}
            id="services-carousel-next-btn"
            aria-label="Next practice area"
            className="absolute right-1 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#0F6B4C]/25 text-[#0F6B4C] shadow-lg hover:shadow-xl hover:bg-[#0F6B4C] hover:text-white transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0F6B4C] active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Scrollable Cards Track */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-3 px-10 sm:px-14 md:px-16 snap-x snap-proximity scroll-smooth"
          >
            {filteredServices.map((service, idx) => (
              <div
                key={`${service.id}-${idx}`}
                id={`service-card-${service.id}-${idx}`}
                className="w-[82vw] max-w-[340px] sm:w-[320px] md:w-[350px] lg:w-[380px] shrink-0 snap-start bg-white rounded-2xl p-5 sm:p-7 border border-[#0F6B4C]/15 shadow-xs hover:shadow-lg transition-all duration-300 hover:border-[#0F6B4C]/50 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer text-left"
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
                <span className="text-[11px] sm:text-xs font-bold text-[#0F6B4C] bg-[#E8F5F0] px-2.5 py-0.5 rounded-full inline-block mt-0.5">
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
