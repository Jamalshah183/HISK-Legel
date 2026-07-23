export interface PracticeArea {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  badge: string;
  keyBenefits: string[];
  caseScenarios: string[];
  leadAttorney: string;
  avgSavingsRange: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: 'FBR Updates' | 'Corporate Tax' | 'Property & 7E' | 'IT & Freelancer' | 'Tax Returns';
  date: string;
  readTime: string;
  excerpt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  keyTakeaways: string[];
  content: string[];
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  clientInitials: string;
  clientRole: string;
  location: string;
  caseType: string;
  dollarSaved: string;
  rating: number;
  reviewText: string;
  verifiedBadge: boolean;
  date: string;
}

export interface Attorney {
  id: string;
  name: string;
  title: string;
  credentials: string[];
  experienceYears: number;
  specialty: string;
  bio: string;
  fullBio?: string[];
  image: string;
  keyWin: string;
  isCeo?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'FBR Audits' | 'ATL & Returns' | 'Business & SECP' | 'General';
}

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: 'fbr-audit-litigation',
    title: 'FBR Audit & Show Cause Defense',
    shortDesc: 'Defense against FBR show-cause notices, tax tribunal appeals, and High Court tax writs.',
    fullDesc: 'When the Federal Board of Revenue (FBR) issues audit notices or show-cause demands under Income Tax Ordinance 2001, our High Court tax advocates provide attorney-client privileged legal defense, challenge unlawful tax assessments, and represent you before Commissioner Appeals (CIR-A) and Appellate Tribunal Inland Revenue (ATIR).',
    iconName: 'ShieldAlert',
    badge: 'High Priority',
    keyBenefits: [
      'Attorney-Client Privilege before FBR tax officers',
      'Stay orders against bank account attachment & forced recovery',
      'High Court & ATIR Tribunal trial representation',
      'Waiver of default surcharge and Section 182 penalties'
    ],
    caseScenarios: [
      'Section 122 amended tax assessment show-cause notices',
      'Section 177 & 214C FBR audit defense for business & high earners',
      'Unexplained income / wealth discrepancies inquiries under Section 111',
      'Sales tax audit disallowances and input tax adjustment disputes'
    ],
    leadAttorney: 'Advocate Alexander Vance, High Court Tax Bar',
    avgSavingsRange: 'Rs. 25 Lakh - Rs. 15 Crore+'
  },
  {
    id: 'atl-filer-status-ntn',
    title: 'NTN & Active Taxpayer List (ATL)',
    shortDesc: 'Rapid NTN registration, income tax return filing, and active filer status restoration.',
    fullDesc: 'Protect your bank transactions, property purchases, and automobile transfers from heavy non-filer withholding taxes (236G, 236H, 236K). We handle expedited NTN registration, wealth statement filing, and instant restoration on FBR Active Taxpayer List (ATL).',
    iconName: 'CheckCircle',
    badge: 'Essential',
    keyBenefits: [
      '50%+ reduction in withholding tax rates across banking & property',
      'Seamless FBR Active Taxpayer List (ATL) inclusion',
      'Audit-proof wealth statement & wealth reconciliation filing',
      'Removal from FBR SIM card & electricity connection blockage lists'
    ],
    caseScenarios: [
      'Commercial property purchases without non-filer surcharges',
      'Restoring Active Taxpayer status after delayed annual filing',
      'Individual, Partnership (AOP), & Company NTN registration',
      'Expat Pakistani remittance tax exemption filings'
    ],
    leadAttorney: 'Advocate Muhammad Bilal, Senior Tax Counsel',
    avgSavingsRange: 'Rs. 5 Lakh - Rs. 50 Lakh+'
  },
  {
    id: 'corporate-secp-tax',
    title: 'Corporate Tax & SECP Advisory',
    shortDesc: 'Tax-efficient Private Limited incorporation, SECP compliance, and corporate tax optimization.',
    fullDesc: 'We structure startups, family businesses, and multi-national corporations for tax efficiency under Pakistani tax law. From Private Limited & Single Member Company (SMC) registration to corporate income tax filing and dividend tax planning.',
    iconName: 'Building2',
    badge: 'Business Growth',
    keyBenefits: [
      'Corporate income tax optimization (29% statutory rate)',
      'SECP & FBR annual compliance integration',
      'Group taxation & holding company structures',
      'Withholding tax agent compliance management'
    ],
    caseScenarios: [
      'Converting sole proprietorships into Private Limited Companies',
      'Tax-free corporate restructuring & business mergers',
      'Super Tax (Section 4C) liability minimization',
      'Dividends and inter-company transaction tax planning'
    ],
    leadAttorney: 'Advocate Ayesha Khan, LL.M. (Corporate Tax)',
    avgSavingsRange: 'Rs. 10 Lakh - Rs. 5 Crore+'
  },
  {
    id: 'it-exporter-remittance-tax',
    title: 'IT Exporter & Foreign Remittance',
    shortDesc: 'PSEB tax exemption, Section 154A 0.25% export tax, and foreign remittance protection.',
    fullDesc: 'Specialized legal tax structuring for IT/ITeS exporters, software houses, tech freelancers, and remote workers. We ensure full compliance with Section 154A for the 0.25% reduced final tax regime, PSEB registration, and Section 111(4) foreign remittance tax exemption.',
    iconName: 'Coins',
    badge: 'IT & Freelancer',
    keyBenefits: [
      '0.25% Final Tax Regime under Section 154A',
      'PSEB & P@SHA tax incentive enrollment',
      '100% Tax credit for IT/ITeS export proceeds',
      'Foreign bank remittance Section 111(4) protection'
    ],
    caseScenarios: [
      'Defending software houses against 29% corporate tax re-classifications',
      'Freelancer IT export remittance audit notices',
      'State Bank of Pakistan (SBP) foreign currency account compliance',
      'US LLC & Pakistani company dual tax optimization'
    ],
    leadAttorney: 'Advocate Alexander Vance, High Court Tax Bar',
    avgSavingsRange: 'Rs. 5 Lakh - Rs. 2 Crore+'
  },
  {
    id: 'property-7e-cvt-tax',
    title: 'Property & Section 7E Tax',
    shortDesc: 'Legal compliance for Section 7E deemed income tax, CVT, and Capital Gains (37A).',
    fullDesc: 'High-net-worth real estate owners face complex tax levies including Section 7E (5% deemed rental income tax), Capital Gains Tax (CGT Section 37A), and Capital Value Tax (CVT). We provide constitutional High Court writ protections and compliant valuation strategies.',
    iconName: 'Landmark',
    badge: 'Wealth Defense',
    keyBenefits: [
      'Section 7E exemption certificates (FBR Form A)',
      'High Court tax writ stay protections',
      'Capital gains tax holding period optimization',
      'FBR-notified valuation vs actual price reconciliation'
    ],
    caseScenarios: [
      'High net worth real estate portfolio restructuring',
      'Transferring inherited property without unexpected tax spikes',
      'Commercial plaza construction tax planning',
      'Plot sales & FBR tax clearance certificates'
    ],
    leadAttorney: 'Advocate Muhammad Bilal, Senior Tax Counsel',
    avgSavingsRange: 'Rs. 15 Lakh - Rs. 10 Crore+'
  },
  {
    id: 'sales-tax-pra-srb',
    title: 'Sales Tax & Provincial Authorities',
    shortDesc: 'Federal Sales Tax (FBR) & Provincial Services Tax (PRA, SRB, KPRA, BRA) registration & audit.',
    fullDesc: 'Managing dual-tier sales tax in Pakistan (FBR for goods, PRA/SRB/KPRA for services) requires expert guidance. We represent businesses in sales tax registration, input tax credit reconciliation, sales tax audit defense, and provincial jurisdiction disputes.',
    iconName: 'Scale',
    badge: 'Compliance',
    keyBenefits: [
      'Input tax credit disallowance resolution',
      'PRA, SRB, KPRA & FBR dual-registration harmony',
      'Sales tax audit notice defense',
      'Annexure-C & monthly sales tax return filing'
    ],
    caseScenarios: [
      'Resolving PRA vs FBR jurisdiction disputes for service providers',
      'Manufacturing unit sales tax audit defense',
      'Export zero-rated sales tax refund claims',
      'Restaurant & retail POS integration tax appeals'
    ],
    leadAttorney: 'Advocate Ayesha Khan, LL.M. (Corporate Tax)',
    avgSavingsRange: 'Rs. 10 Lakh - Rs. 3 Crore+'
  }
];

export const ATTORNEYS: Attorney[] = [
  {
    id: 'hafiz-irfan-shabber-kayani',
    name: 'Hafiz Irfan Shabber Kayani',
    title: 'Advocate High Court | Founder & Chief Executive Officer, HISK LEGAL',
    credentials: ['Advocate High Court', 'Founder & CEO', 'Senior Legal Counsel'],
    experienceYears: 20,
    specialty: 'Civil, Criminal, Corporate, Banking, Property, Tax, Constitutional & Cross-Border Law',
    bio: 'Advocate High Court and Founder & Chief Executive Officer of HISK LEGAL, providing strategic, commercially focused, and results-oriented legal services across Pakistan.',
    fullBio: [
      'Hafiz Irfan Shabber Kayani is an Advocate High Court and the Founder & Chief Executive Officer of HISK LEGAL, a full-service law firm dedicated to providing strategic, commercially focused, and results-oriented legal services to individuals, businesses, financial institutions, and international clients.',
      'His practice encompasses Civil Law, Criminal Law, Corporate and Commercial Law, Banking and Finance Law, Family Law, Property and Real Estate Law, Rent Law, Taxation Law, Customs Law, Immigration Law, Consumer Protection Law, Constitutional Law, Debt Recovery, Regulatory Compliance, and Narcotics Law. He regularly advises and represents clients in complex disputes, regulatory matters, contractual issues, and cross-border legal matters before courts, tribunals, and administrative authorities throughout Pakistan.',
      'Mr. Kayani is recognised for his meticulous legal drafting, analytical approach, and strategic advocacy. He works closely with clients to understand their legal and commercial objectives, providing practical advice, effective risk management and tailored legal strategies designed to achieve efficient and sustainable outcomes.',
      'Under his leadership, HISK LEGAL has established itself as a trusted legal adviser by combining technical excellence with responsiveness, integrity, and unwavering professional standards. The firm is committed to delivering exceptional legal representation across contentious and non-contentious matters while maintaining the highest standards of ethics, confidentiality and client care.',
      'Whether representing clients in high-stakes litigation, advising corporate entities on regulatory and commercial matters, assisting families with sensitive legal issues or acting for local and international businesses in complex transactions, Mr. Kayani remains committed to providing legal solutions that are practical, innovative, and aligned with each client\'s long-term interests.'
    ],
    image: 'https://i.postimg.cc/VvWYYzzW/CEO.jpg',
    keyWin: 'Founded HISK LEGAL, leading high-stakes litigation, corporate advisory, and cross-border legal solutions.',
    isCeo: true
  },
  {
    id: 'mirza-ahmed-raza',
    name: 'Mirza Ahmed Raza',
    title: 'Advocate, Islamabad | Associate Counsel',
    credentials: ['Advocate', 'Islamabad Bar', 'Associate Counsel'],
    experienceYears: 8,
    specialty: 'Civil Litigation, Property Disputes, Corporate Advisory & High Court Writs',
    bio: 'Advocate Mirza Ahmed Raza is a practicing Advocate in Islamabad specializing in civil litigation, property disputes, constitutional petitions, and corporate compliance at HISK LEGAL.',
    fullBio: [
      'Mirza Ahmed Raza is an Advocate practicing in Islamabad and Associate Counsel at HISK LEGAL.',
      'He regularly advises and represents clients in complex civil litigation, property disputes, contractual issues, constitutional petitions, and corporate compliance before Islamabad courts, tribunals, and regulatory authorities.',
      'Known for his meticulous research, articulate advocacy, and dedicated client care, Mr. Raza works closely with individuals and commercial clients to protect their legal rights and achieve optimal legal remedies.'
    ],
    image: 'https://i.postimg.cc/yY6Km4V5/Associate-1.jpg',
    keyWin: 'Secured favorable relief in complex civil litigation and property disputes in Islamabad.'
  },
  {
    id: 'muhammad-rizwan-malik',
    name: 'Muhammad Rizwan Malik',
    title: 'Advocate High Court | Associate Counsel',
    credentials: ['Advocate High Court', 'Associate Counsel', 'High Court Bar'],
    experienceYears: 12,
    specialty: 'High Court Writs, Civil & Criminal Litigation, Corporate Law & Commercial Disputes',
    bio: 'Advocate High Court Muhammad Rizwan Malik is an Associate Counsel at HISK LEGAL specializing in High Court writ petitions, complex civil and criminal litigation, corporate legal affairs, and regulatory disputes.',
    fullBio: [
      'Muhammad Rizwan Malik is an Advocate High Court and Associate Counsel at HISK LEGAL.',
      'He brings extensive courtroom advocacy experience in High Court writ petitions, criminal defense, civil suits, property litigation, and commercial legal affairs across tribunals and High Courts in Pakistan.',
      'Mr. Malik is dedicated to strategic client representation, delivering rigorous legal analysis, meticulous case preparation, and effective legal solutions tailored to client objectives.'
    ],
    image: 'https://i.postimg.cc/Qtsx9f0Q/advocate-high-court.jpg',
    keyWin: 'Successfully represented clients in high-stakes High Court constitutional writs and civil appeals.'
  },
  {
    id: 'jamshaid-khan',
    name: 'Jamshaid Khan',
    title: 'Advocate High Court | Associate Counsel',
    credentials: ['Advocate High Court', 'Associate Counsel', 'High Court Bar'],
    experienceYears: 10,
    specialty: 'High Court Writs, Constitutional Petitions, Criminal Law & Civil Litigation',
    bio: 'Advocate High Court Jamshaid Khan is an Associate Counsel at HISK LEGAL specializing in High Court writ petitions, constitutional law, criminal litigation, and corporate legal advisory.',
    fullBio: [
      'Jamshaid Khan is an Advocate High Court and Associate Counsel at HISK LEGAL.',
      'He specializes in High Court constitutional writs, complex criminal defense, civil litigation, and corporate dispute resolution before various courts and tribunals across Pakistan.',
      'Known for his compelling courtroom advocacy, thorough legal research, and unwavering commitment to client success, Mr. Khan delivers effective strategies for high-stakes legal matters.'
    ],
    image: 'https://i.postimg.cc/qRCSrr8s/associate-3.jpg',
    keyWin: 'Achieved significant relief in High Court constitutional writs and complex criminal and civil proceedings.'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'fbr-tax-slabs-2024-2025',
    title: 'FBR Income Tax Slabs FY 2024-25 & 2025-26: Complete Guide for Salaried & Business',
    slug: 'fbr-tax-slabs-2024-2025',
    category: 'FBR Updates',
    date: 'February 12, 2026',
    readTime: '6 min read',
    featured: true,
    excerpt: 'Detailed breakdown of the updated FBR tax slabs for salaried individuals, business owners, and Association of Persons (AOPs), including high earner surcharges.',
    author: {
      name: 'Hafiz Irfan Shabber Kayani',
      role: 'Advocate High Court | Founder & CEO',
      avatar: 'https://i.postimg.cc/VvWYYzzW/CEO.jpg'
    },
    keyTakeaways: [
      'Salaried individuals paying up to 35% tax on taxable income exceeding Rs. 4.1 Million.',
      'Non-salaried business individuals taxed up to 45% on income exceeding Rs. 5.6 Million.',
      'Active Taxpayer List (ATL) filers avoid 100% withholding tax penalties on bank transactions.'
    ],
    content: [
      'The Federal Board of Revenue (FBR) revised income tax brackets under the Finance Act. For salaried employees, tax rates start at 5% above Rs. 600,000 annual income and scale up to 35% for amounts over Rs. 4.1 Million.',
      'Business individuals and AOPs face steeper tax brackets up to 45% for annual profits exceeding Rs. 5.6 Million.',
      'To prevent excessive withholding tax deductions at source (Section 236G/236H/236K), taxpayers must ensure their returns are submitted before the statutory deadline to stay active on the ATL list.',
      'Our tax advocates assist clients in optimizing allowable tax credits, provident fund exemptions, and legitimate business expense deductions under Income Tax Ordinance 2001.'
    ]
  },
  {
    id: 'section-7e-property-tax-pakistan',
    title: 'Section 7E Deemed Income Tax on Property: Exemption Criteria & Legal Rights',
    slug: 'section-7e-property-tax-pakistan',
    category: 'Property & 7E',
    date: 'January 28, 2026',
    readTime: '7 min read',
    featured: true,
    excerpt: 'Section 7E levies a 5% deemed rental income tax on immovable properties. Learn which properties qualify for exemption and how to obtain FBR Form A certificates.',
    author: {
      name: 'Mirza Ahmed Raza',
      role: 'Advocate, Islamabad',
      avatar: 'https://i.postimg.cc/yY6Km4V5/Associate-1.jpg'
    },
    keyTakeaways: [
      'One self-owned residential house is strictly exempt from Section 7E deemed tax.',
      'Properties with fair market value under Rs. 2.5 Crore total aggregate receive exemption.',
      'Commercial plots under active construction receive specific statutory exemptions.'
    ],
    content: [
      'Under Section 7E of the Income Tax Ordinance, every resident individual owning immovable property exceeding Rs. 2.5 Crore aggregate value is deemed to earn rent equal to 5% of the property value, taxed at 20% (effective 1% tax on total market value).',
      'Exemptions apply to: 1) One residential house owned and occupied by the taxpayer, 2) Agricultural land, 3) Property owned by local authorities or provincial governments.',
      'To transfer or sell property, FBR now requires a Section 7E Exemption Certificate (Form A) issued by the Commissioner Inland Revenue.',
      'Our firm files constitutional writs in High Court to challenge illegal Section 7E demands and assists clients in securing official exemption clearance.'
    ]
  },
  {
    id: 'it-exporter-section-154a-tax',
    title: 'IT Exporters & Freelancers: How to Claim 0.25% Reduced Tax Rate Under Section 154A',
    slug: 'it-exporter-section-154a-tax',
    category: 'IT & Freelancer',
    date: 'January 14, 2026',
    readTime: '5 min read',
    featured: false,
    excerpt: 'Pakistani software houses, IT exporters, and tech freelancers can pay a final concessionary tax rate of 0.25% on foreign export proceeds if PSEB registration conditions are met.',
    author: {
      name: 'Muhammad Rizwan Malik',
      role: 'Advocate High Court',
      avatar: 'https://i.postimg.cc/Qtsx9f0Q/advocate-high-court.jpg'
    },
    keyTakeaways: [
      'Export proceeds must be received through formal banking channels in foreign exchange.',
      'Must be registered with Pakistan Software Export Board (PSEB) or P@SHA.',
      'Annual tax returns and monthly withholding statements must be filed on time.'
    ],
    content: [
      'Section 154A of the Income Tax Ordinance provides a reduced 0.25% final tax rate on foreign proceeds derived from export of computer software, IT services, or IT-enabled services (ITeS).',
      'If mandatory PSEB registration or annual return filing is missed, FBR reclassifies IT exporters under normal corporate tax (29%) or individual business tax (up to 45%).',
      'We guide IT companies through PSEB enrollment, State Bank R-Form reconciliation, and FBR return filing to ensure 100% tax credit protection.'
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'rev-1',
    clientInitials: 'T. R.',
    clientRole: 'CEO, Tech Software House',
    location: 'Lahore, Pakistan',
    caseType: 'IT Export Tax & FBR Section 154A Audit',
    dollarSaved: 'Rs. 3.2 Crore',
    rating: 5,
    reviewText: 'FBR issued a Rs. 3.8 Crore tax demand by reclassifying our IT export proceeds under normal corporate tax. The legal team at HISK LEGAL took our case to the High Court and secured a complete stay and victory. Exceptional legal service.',
    verifiedBadge: true,
    date: 'January 2026'
  },
  {
    id: 'rev-2',
    clientInitials: 'M. A.',
    clientRole: 'Real Estate Developer',
    location: 'Islamabad, Pakistan',
    caseType: 'Section 7E Property Tax & FBR Clearance',
    dollarSaved: 'Rs. 8.5 Crore',
    rating: 5,
    reviewText: 'We were facing massive Section 7E property tax demands on our commercial holdings. HISK LEGAL handled our valuation appeals and secured FBR Form A exemption certificates smoothly. Highly recommended.',
    verifiedBadge: true,
    date: 'December 2025'
  },
  {
    id: 'rev-3',
    clientInitials: 'S. H.',
    clientRole: 'Managing Director, Distribution Firm',
    location: 'Karachi, Pakistan',
    caseType: 'Sales Tax Audit & PRA Disallowance',
    dollarSaved: 'Rs. 1.8 Crore',
    rating: 5,
    reviewText: 'Our sales tax input credits were arbitrarily disallowed during an FBR & PRA joint audit. HISK LEGAL filed a tribunal appeal and cleared all assessments without penalty. True legal professionals.',
    verifiedBadge: true,
    date: 'February 2026'
  },
  {
    id: 'rev-4',
    clientInitials: 'F. K.',
    clientRole: 'Overseas Pakistani Investor',
    location: 'Rawalpindi / UK',
    caseType: 'Foreign Remittance Sec 111(4) Protection',
    dollarSaved: 'Rs. 4.2 Crore',
    rating: 5,
    reviewText: 'I transferred funds from the UK to purchase commercial property in Pakistan and received an FBR audit notice under Section 111. HISK LEGAL established foreign remittance protection under Sec 111(4) instantly via WhatsApp. Extremely convenient.',
    verifiedBadge: true,
    date: 'November 2025'
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'Why should I hire a High Court Tax Advocate instead of a local accountant for FBR notices?',
    answer: 'Under Pakistani law, High Court Advocates possess statutory Attorney-Client Privilege. Discussions with an advocate are strictly confidential and protected from FBR subpoenas. Furthermore, advocates can file High Court writs, obtain stay orders against bank account attachments, and represent you in Appellate Tribunals (ATIR).',
    category: 'FBR Audits'
  },
  {
    question: 'How does your direct WhatsApp advocate consultation work?',
    answer: 'Clicking any WhatsApp button connects you directly to our law firm’s advocate desk. You can share your FBR notice or tax document confidentially and receive rapid legal advice from a qualified tax advocate.',
    category: 'General'
  },
  {
    question: 'Can FBR freeze my bank account or block my mobile SIM card?',
    answer: 'Yes. FBR has authority under Section 140 to issue bank recovery notices and under Income Tax Ordinance provisions to block SIM cards / electricity meters for non-filers. However, as soon as HISK LEGAL files a representation or High Court stay writ, enforcement actions are legally suspended.',
    category: 'FBR Audits'
  },
  {
    question: 'What is Active Taxpayer List (ATL) status and why is it critical?',
    answer: 'ATL status confirms you are a compliant filer on FBR records. Active taxpayers pay up to 50% lower withholding tax rates on bank cash withdrawals, property purchases, vehicle registrations, and stock trades compared to non-filers.',
    category: 'ATL & Returns'
  },
  {
    question: 'What is Section 7E property tax and how can I claim exemption?',
    answer: 'Section 7E taxes deemed rental income at 20% on 5% of property value (1% effective tax). One self-owned residence and properties valued under Rs. 2.5 Crore total are exempt. We help file Form A exemption certificates with FBR.',
    category: 'ATL & Returns'
  }
];

export const FIRM_METRICS = {
  totalTaxSaved: 'Rs. 50 Crore+',
  casesHandled: '2,500+',
  auditReliefRate: '99.4%',
  yearsInPractice: '20+'
};
