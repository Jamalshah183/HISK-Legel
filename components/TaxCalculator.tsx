'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  MessageCircle,
  Building,
  UserCheck,
  Building2,
  Home,
  CheckCircle,
  Info,
  Percent,
  FileText
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export const TaxCalculator: React.FC = () => {
  // Mode Selection
  const [calcMode, setCalcMode] = useState<'salaried' | 'nonsalaried' | 'corporate' | 'property'>('salaried');

  // --- 1. Salaried Inputs ---
  const [salariedIncome, setSalariedIncome] = useState<number>(3600000); // Rs. 36 Lakhs
  const [isSalaryAbove75, setIsSalaryAbove75] = useState<boolean>(true); // FBR Rule: Salary >= 75% of total income

  // --- 2. Non-Salaried / AOP Inputs ---
  const [businessIncome, setBusinessIncome] = useState<number>(6000000); // Rs. 60 Lakhs
  const [isProfessionalAOP, setIsProfessionalAOP] = useState<boolean>(false); // Law firm / Professional AOP 40% cap

  // --- 3. Corporate Inputs ---
  const [corporateTaxableIncome, setCorporateTaxableIncome] = useState<number>(15000000); // Rs. 1.5 Crore
  const [corporateTurnover, setCorporateTurnover] = useState<number>(100000000); // Rs. 10 Crore
  const [isITExport, setIsITExport] = useState<boolean>(false);

  // --- 4. Property Inputs ---
  const [propertyValue, setPropertyValue] = useState<number>(20000000); // Rs. 2 Crore

  // ==========================================
  // SALARIED TAX CALCULATION (Finance Act 2026)
  // ==========================================
  const salariedCalc = useMemo(() => {
    const income = salariedIncome;

    // If salary is less than 75% of total income, non-salaried slabs apply
    if (!isSalaryAbove75) {
      return {
        appliedMode: 'Non-Salaried Slabs (Salary < 75% of Total Income)',
        annualTax: calculateNonSalariedTax(income, false).totalTax,
        monthlyTax: Math.round(calculateNonSalariedTax(income, false).totalTax / 12),
        monthlyTakeHome: Math.round((income - calculateNonSalariedTax(income, false).totalTax) / 12),
        effectiveRate: income > 0 ? ((calculateNonSalariedTax(income, false).totalTax / income) * 100).toFixed(1) : '0.0',
        surcharge: calculateNonSalariedTax(income, false).surcharge,
        baseTax: calculateNonSalariedTax(income, false).baseTax
      };
    }

    let tax = 0;
    if (income <= 600000) {
      tax = 0;
    } else if (income <= 1200000) {
      tax = (income - 600000) * 0.01;
    } else if (income <= 2200000) {
      tax = 6000 + (income - 1200000) * 0.11;
    } else if (income <= 3200000) {
      tax = 116000 + (income - 2200000) * 0.20;
    } else if (income <= 4100000) {
      tax = 316000 + (income - 3200000) * 0.25;
    } else if (income <= 5600000) {
      tax = 541000 + (income - 4100000) * 0.29;
    } else if (income <= 7000000) {
      tax = 976000 + (income - 5600000) * 0.32;
    } else {
      tax = 1424000 + (income - 7000000) * 0.35;
    }

    // No surcharge for salaried individuals in FY 2026-27 (Abolished)
    const annualTax = Math.round(tax);
    const monthlyTax = Math.round(annualTax / 12);
    const monthlyTakeHome = Math.round((income - annualTax) / 12);
    const effectiveRate = income > 0 ? ((annualTax / income) * 100).toFixed(1) : '0.0';

    return {
      appliedMode: 'Salaried Individual (Slabs FY 2026-27)',
      annualTax,
      monthlyTax,
      monthlyTakeHome,
      effectiveRate,
      surcharge: 0,
      baseTax: annualTax
    };
  }, [salariedIncome, isSalaryAbove75]);

  // Helper for Non-Salaried Tax Slabs (Finance Act 2026)
  function calculateNonSalariedTax(profit: number, isProfAOP: boolean) {
    let baseTax = 0;

    if (profit <= 600000) {
      baseTax = 0;
    } else if (profit <= 1200000) {
      baseTax = (profit - 600000) * 0.15;
    } else if (profit <= 1600000) {
      baseTax = 90000 + (profit - 1200000) * 0.20;
    } else if (profit <= 3200000) {
      baseTax = 170000 + (profit - 1600000) * 0.30;
    } else if (profit <= 5600000) {
      baseTax = 650000 + (profit - 3200000) * 0.40;
    } else {
      const topRate = isProfAOP ? 0.40 : 0.45;
      baseTax = 1610000 + (profit - 5600000) * topRate;
    }

    // 10% Surcharge applies if income > Rs. 10,000,000
    let surcharge = 0;
    if (profit > 10000000) {
      surcharge = baseTax * 0.10;
    }

    const totalTax = Math.round(baseTax + surcharge);
    return { baseTax: Math.round(baseTax), surcharge: Math.round(surcharge), totalTax };
  }

  // ==========================================
  // NON-SALARIED / AOP CALCULATION
  // ==========================================
  const nonSalariedCalc = useMemo(() => {
    const profit = businessIncome;
    const { baseTax, surcharge, totalTax } = calculateNonSalariedTax(profit, isProfessionalAOP);

    const effectiveRate = profit > 0 ? ((totalTax / profit) * 100).toFixed(1) : '0.0';

    // Corporate comparison (29% company tax or Small Company 20%)
    const corporateTax29 = Math.round(profit * 0.29);
    const potentialCorporateSavings = Math.max(0, totalTax - corporateTax29);

    return {
      annualTax: totalTax,
      baseTax,
      surcharge,
      effectiveRate,
      potentialCorporateSavings
    };
  }, [businessIncome, isProfessionalAOP]);

  // ==========================================
  // CORPORATE CALCULATION
  // ==========================================
  const corporateCalc = useMemo(() => {
    const income = corporateTaxableIncome;
    const turnover = corporateTurnover;

    // Small Company Check: Turnover <= Rs. 250M
    const isSmallCompany = turnover <= 250000000;
    const standardRate = isSmallCompany ? 0.20 : 0.29;

    let incomeTax = Math.round(income * standardRate);

    // Minimum Turnover Tax = 1.25% of Gross Turnover
    const minTurnoverTax = Math.round(turnover * 0.0125);

    // IT Export Option = 1.25% flat or 0.25% export receipts
    const itExportTax = Math.round(turnover * 0.0125);

    if (isITExport) {
      incomeTax = itExportTax;
    } else {
      // Company pays higher of Normal Tax vs Minimum Turnover Tax
      incomeTax = Math.max(incomeTax, minTurnoverTax);
    }

    const effectiveRate = income > 0 ? ((incomeTax / income) * 100).toFixed(1) : '0.0';

    return {
      isSmallCompany,
      applicableRateText: isITExport
        ? '1.25% IT/ITeS Export Regime'
        : isSmallCompany
        ? '20% Small Company Rate (Turnover ≤ Rs. 250M)'
        : '29% Standard Corporate Rate',
      finalTax: incomeTax,
      minTurnoverTax,
      effectiveRate
    };
  }, [corporateTaxableIncome, corporateTurnover, isITExport]);

  // ==========================================
  // PROPERTY WITHHOLDING TAX (Sec 236K & 236C)
  // ==========================================
  const propertyCalc = useMemo(() => {
    const val = propertyValue;
    const purchaseTax236K = Math.round(val * 0.03); // 3% Sec 236K
    const saleTax236C = Math.round(val * 0.03); // 3% Sec 236C
    const totalWithholding = purchaseTax236K + saleTax236C;

    return {
      purchaseTax236K,
      saleTax236C,
      totalWithholding
    };
  }, [propertyValue]);

  // WhatsApp Export Details
  const getWhatsAppUrl = () => {
    let details = {};
    if (calcMode === 'salaried') {
      details = {
        calcType: 'Pakistan Salaried Tax Calculator (FY 2026-27)',
        income: `Annual Income: Rs. ${salariedIncome.toLocaleString()}`,
        filingStatus: salariedCalc.appliedMode,
        estimatedTax: `Rs. ${salariedCalc.annualTax.toLocaleString()} / year (Rs. ${salariedCalc.monthlyTax.toLocaleString()} / mo)`,
        effectiveRate: `${salariedCalc.effectiveRate}%`
      };
    } else if (calcMode === 'nonsalaried') {
      details = {
        calcType: 'Pakistan Non-Salaried / AOP Tax Calculator (FY 2026-27)',
        income: `Annual Net Profit: Rs. ${businessIncome.toLocaleString()}`,
        filingStatus: isProfessionalAOP ? 'Professional AOP (Capped at 40%)' : 'Sole Proprietor / AOP',
        estimatedTax: `Rs. ${nonSalariedCalc.annualTax.toLocaleString()} (Base Tax: Rs. ${nonSalariedCalc.baseTax.toLocaleString()}, Surcharge: Rs. ${nonSalariedCalc.surcharge.toLocaleString()})`,
        effectiveRate: `${nonSalariedCalc.effectiveRate}%`
      };
    } else if (calcMode === 'corporate') {
      details = {
        calcType: 'Corporate & Company Tax Calculator (FY 2026-27)',
        income: `Taxable Income: Rs. ${corporateTaxableIncome.toLocaleString()}, Turnover: Rs. ${corporateTurnover.toLocaleString()}`,
        filingStatus: corporateCalc.applicableRateText,
        estimatedTax: `Rs. ${corporateCalc.finalTax.toLocaleString()}`,
        effectiveRate: `${corporateCalc.effectiveRate}%`
      };
    } else {
      details = {
        calcType: 'Property Withholding Tax Calculator (Sec 236K / 236C)',
        income: `Property Value: Rs. ${propertyValue.toLocaleString()}`,
        filingStatus: 'FBR Property Tax Withholding (3% Flat Purchase & Sale)',
        estimatedTax: `Purchase Tax (Sec 236K): Rs. ${propertyCalc.purchaseTax236K.toLocaleString()} | Sale Tax (Sec 236C): Rs. ${propertyCalc.saleTax236C.toLocaleString()}`
      };
    }

    return buildWhatsAppUrl({ topic: 'tax_calculator', calcDetails: details });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      id="calculator"
      className="scroll-mt-20 sm:scroll-mt-24 py-10 sm:py-14 lg:py-16 bg-[#FAFAF7] border-b border-gray-200/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: -20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-6 sm:mb-8"
        >
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight">
            Official FBR Tax Calculator
          </h2>
        </motion.div>

        {/* Mode Switcher Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="bg-white p-1.5 rounded-2xl border border-[#0F6B4C]/20 shadow-sm inline-flex flex-wrap sm:flex-nowrap gap-1.5 w-full max-w-4xl justify-center">
            <button
              onClick={() => setCalcMode('salaried')}
              id="calc-mode-salaried-btn"
              className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                calcMode === 'salaried'
                  ? 'bg-[#0F6B4C] text-[#FAFAF7] shadow-sm'
                  : 'text-[#1A1A1A] hover:bg-gray-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Salaried Class</span>
            </button>

            <button
              onClick={() => setCalcMode('nonsalaried')}
              id="calc-mode-nonsalaried-btn"
              className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                calcMode === 'nonsalaried'
                  ? 'bg-[#0F6B4C] text-[#FAFAF7] shadow-sm'
                  : 'text-[#1A1A1A] hover:bg-gray-100'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Non-Salaried / AOP</span>
            </button>

            <button
              onClick={() => setCalcMode('corporate')}
              id="calc-mode-corporate-btn"
              className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                calcMode === 'corporate'
                  ? 'bg-[#0F6B4C] text-[#FAFAF7] shadow-sm'
                  : 'text-[#1A1A1A] hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Corporate / Co.</span>
            </button>

            <button
              onClick={() => setCalcMode('property')}
              id="calc-mode-property-btn"
              className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                calcMode === 'property'
                  ? 'bg-[#0F6B4C] text-[#FAFAF7] shadow-sm'
                  : 'text-[#1A1A1A] hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Property Tax</span>
            </button>
          </div>
        </motion.div>

        {/* Main Grid: Input Panel + Result Card */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Inputs Column */}
          <motion.div
            initial={{ opacity: 0, x: -35, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#0F6B4C]/20 shadow-xs flex flex-col justify-between space-y-6"
          >
            
            {/* --- SALARIED MODE --- */}
            {calcMode === 'salaried' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A]">
                    Salaried Tax Calculator (FY 2026-27)
                  </h3>
                  <span className="text-[11px] font-extrabold bg-[#E8F5F0] text-[#0F6B4C] px-2.5 py-1 rounded-full">
                    Surcharge Abolished
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-heading font-bold text-sm text-[#1A1A1A]">
                      Gross Annual Salaried Income (PKR)
                    </label>
                    <span className="font-heading font-extrabold text-lg sm:text-xl text-[#0F6B4C]">
                      Rs. {salariedIncome.toLocaleString()}
                    </span>
                  </div>

                  {/* Manual Number Input */}
                  <div className="relative mb-3">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                    <input
                      type="number"
                      value={salariedIncome}
                      onChange={(e) => setSalariedIncome(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-12 pr-4 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-hidden focus:border-[#0F6B4C]"
                      placeholder="Enter annual income"
                    />
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="600000"
                    max="15000000"
                    step="100000"
                    value={salariedIncome}
                    onChange={(e) => setSalariedIncome(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0F6B4C]"
                    id="salaried-income-slider"
                  />
                  <div className="flex justify-between text-[11px] text-[#5A6275] font-semibold mt-1">
                    <span>Rs. 6 Lakhs (0%)</span>
                    <span>Rs. 36 Lakhs</span>
                    <span>Rs. 1.5 Crore+</span>
                  </div>
                </div>

                {/* 75% Salary Rule Toggle */}
                <div className="p-4 bg-[#FAFAF7] rounded-2xl border border-gray-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#0F6B4C]" />
                      Does Salary constitute ≥ 75% of Total Income?
                    </span>
                    <button
                      onClick={() => setIsSalaryAbove75(!isSalaryAbove75)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                        isSalaryAbove75
                          ? 'bg-[#0F6B4C] text-white'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {isSalaryAbove75 ? 'Yes (Salaried Slabs)' : 'No (Non-Salaried Slabs Apply)'}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5A6275] leading-relaxed">
                    Under FBR rules, if non-salary income (e.g. rent, business) pushes salary below 75% of total income, the higher Non-Salaried Tax Slabs apply automatically.
                  </p>
                </div>
              </div>
            )}

            {/* --- NON-SALARIED / AOP MODE --- */}
            {calcMode === 'nonsalaried' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A]">
                    Non-Salaried Individual / AOP / Freelancer
                  </h3>
                  <span className="text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
                    10% Surcharge above Rs. 10M
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-heading font-bold text-sm text-[#1A1A1A]">
                      Annual Net Business Profit (PKR)
                    </label>
                    <span className="font-heading font-extrabold text-lg sm:text-xl text-[#0F6B4C]">
                      Rs. {businessIncome.toLocaleString()}
                    </span>
                  </div>

                  <div className="relative mb-3">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                    <input
                      type="number"
                      value={businessIncome}
                      onChange={(e) => setBusinessIncome(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-12 pr-4 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-hidden focus:border-[#0F6B4C]"
                      placeholder="Enter net profit"
                    />
                  </div>

                  <input
                    type="range"
                    min="600000"
                    max="20000000"
                    step="200000"
                    value={businessIncome}
                    onChange={(e) => setBusinessIncome(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0F6B4C]"
                    id="business-profit-slider"
                  />
                  <div className="flex justify-between text-[11px] text-[#5A6275] font-semibold mt-1">
                    <span>Rs. 6 Lakhs (0%)</span>
                    <span>Rs. 60 Lakhs</span>
                    <span>Rs. 2 Crore+</span>
                  </div>
                </div>

                {/* Professional AOP Toggle */}
                <div className="p-4 bg-[#FAFAF7] rounded-2xl border border-gray-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      Professional AOP (Law Firm, Consultancy barred from incorporation)?
                    </span>
                    <button
                      onClick={() => setIsProfessionalAOP(!isProfessionalAOP)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                        isProfessionalAOP
                          ? 'bg-[#0F6B4C] text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isProfessionalAOP ? 'Yes (Capped at 40%)' : 'No (Standard 45%)'}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5A6275] leading-relaxed">
                    Finance Act 2026 caps top rate at 40% for Professional AOPs prohibited by law from incorporating as companies.
                  </p>
                </div>
              </div>
            )}

            {/* --- CORPORATE MODE --- */}
            {calcMode === 'corporate' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A]">
                    Company & Corporate Tax Rules
                  </h3>
                  <span className="text-[11px] font-extrabold bg-[#E8F5F0] text-[#0F6B4C] px-2.5 py-1 rounded-full">
                    20% / 29% Rates
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-heading font-bold text-xs text-[#1A1A1A] block mb-1">
                      Annual Taxable Income (Net Profit in PKR)
                    </label>
                    <input
                      type="number"
                      value={corporateTaxableIncome}
                      onChange={(e) => setCorporateTaxableIncome(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-hidden focus:border-[#0F6B4C]"
                    />
                  </div>

                  <div>
                    <label className="font-heading font-bold text-xs text-[#1A1A1A] block mb-1">
                      Annual Gross Turnover (PKR)
                    </label>
                    <input
                      type="number"
                      value={corporateTurnover}
                      onChange={(e) => setCorporateTurnover(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-hidden focus:border-[#0F6B4C]"
                    />
                    <span className="text-[11px] text-[#5A6275] mt-1 block font-normal">
                      Small Company threshold: Turnover ≤ Rs. 250M (20% rate). Minimum turnover tax: 1.25%.
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#E8F5F0] rounded-xl border border-[#0F6B4C]/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F6B4C]">
                      Is IT / ITeS Export Revenue?
                    </span>
                    <button
                      onClick={() => setIsITExport(!isITExport)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        isITExport ? 'bg-[#0F6B4C] text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isITExport ? 'Yes (1.25% Flat)' : 'No'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- PROPERTY MODE --- */}
            {calcMode === 'property' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A]">
                    Property Transaction Withholding Tax
                  </h3>
                  <span className="text-[11px] font-extrabold bg-[#E8F5F0] text-[#0F6B4C] px-2.5 py-1 rounded-full">
                    Sec 236K & 236C
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-heading font-bold text-sm text-[#1A1A1A]">
                      Property FBR / DC Valuation Amount (PKR)
                    </label>
                    <span className="font-heading font-extrabold text-lg sm:text-xl text-[#0F6B4C]">
                      Rs. {propertyValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="relative mb-3">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                    <input
                      type="number"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-12 pr-4 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-hidden focus:border-[#0F6B4C]"
                    />
                  </div>

                  <input
                    type="range"
                    min="2000000"
                    max="100000000"
                    step="1000000"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0F6B4C]"
                    id="property-value-slider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-[#E8F5F0] rounded-2xl border border-[#0F6B4C]/20">
                    <span className="text-[10px] font-extrabold text-[#0F6B4C] uppercase block">
                      Buyer Tax (Sec 236K)
                    </span>
                    <span className="text-base font-extrabold text-[#1A1A1A]">3% Flat</span>
                  </div>
                  <div className="p-3 bg-[#E8F5F0] rounded-2xl border border-[#0F6B4C]/20">
                    <span className="text-[10px] font-extrabold text-[#0F6B4C] uppercase block">
                      Seller Tax (Sec 236C)
                    </span>
                    <span className="text-base font-extrabold text-[#1A1A1A]">3% Flat</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Results Output Column */}
          <motion.div
            initial={{ opacity: 0, x: 35, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.65, delay: 0.25 }}
            className="lg:col-span-5 bg-[#0F6B4C] text-[#FAFAF7] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-emerald-700/60 pb-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#F5A623]" />
                  <h3 className="font-heading font-extrabold text-lg text-white">
                    FBR Tax Summary
                  </h3>
                </div>
                <span className="text-xs bg-[#F5A623] text-[#1A1A1A] font-extrabold px-3 py-1 rounded-full">
                  FY 2026-27
                </span>
              </div>

              {/* SALARIED RESULTS */}
              {calcMode === 'salaried' && (
                <div className="space-y-4">
                  <div className="bg-[#0A4B35] p-5 rounded-2xl border border-emerald-600/30">
                    <div className="text-xs text-emerald-200 font-semibold">Total Estimated Annual Tax</div>
                    <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
                      Rs. {salariedCalc.annualTax.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-300 mt-2 flex justify-between font-medium">
                      <span>Monthly Tax: Rs. {salariedCalc.monthlyTax.toLocaleString()}</span>
                      <span>Effective Rate: {salariedCalc.effectiveRate}%</span>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#F5A623]/40">
                    <div className="text-xs text-[#F5A623] font-bold uppercase tracking-wider">
                      Net Monthly Take-Home Pay
                    </div>
                    <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#F5A623] mt-1">
                      Rs. {salariedCalc.monthlyTakeHome.toLocaleString()} / mo
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-200/80 leading-relaxed font-normal">
                    Applied: {salariedCalc.appliedMode}. No surcharge applies to salaried individuals under Finance Act 2026.
                  </p>
                </div>
              )}

              {/* NON-SALARIED RESULTS */}
              {calcMode === 'nonsalaried' && (
                <div className="space-y-4">
                  <div className="bg-[#0A4B35] p-5 rounded-2xl border border-emerald-600/30">
                    <div className="text-xs text-emerald-200 font-semibold">Total Annual Tax Payable</div>
                    <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
                      Rs. {nonSalariedCalc.annualTax.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-300 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Base Tax: Rs. {nonSalariedCalc.baseTax.toLocaleString()}</span>
                        <span>Effective Rate: {nonSalariedCalc.effectiveRate}%</span>
                      </div>
                      {nonSalariedCalc.surcharge > 0 && (
                        <div className="text-amber-300 font-bold">
                          10% Surcharge (&gt;10M): +Rs. {nonSalariedCalc.surcharge.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {nonSalariedCalc.potentialCorporateSavings > 0 && (
                    <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#F5A623]/40">
                      <div className="text-xs text-[#F5A623] font-bold uppercase tracking-wider">
                        Potential Corporate Restructuring Savings
                      </div>
                      <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#F5A623] mt-1">
                        Rs. {nonSalariedCalc.potentialCorporateSavings.toLocaleString()}
                      </div>
                      <span className="text-[11px] text-gray-300 block mt-1">
                        Converting to a Private Limited Company (29% rate) saves substantial tax at high profits.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* CORPORATE RESULTS */}
              {calcMode === 'corporate' && (
                <div className="space-y-4">
                  <div className="bg-[#0A4B35] p-5 rounded-2xl border border-emerald-600/30">
                    <div className="text-xs text-emerald-200 font-semibold">Corporate Tax Liability</div>
                    <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
                      Rs. {corporateCalc.finalTax.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-300 mt-2 space-y-1">
                      <div>Status: {corporateCalc.applicableRateText}</div>
                      <div>Effective Rate: {corporateCalc.effectiveRate}%</div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0A4B35]/60 rounded-2xl border border-emerald-600/20 text-xs text-emerald-200">
                    <span className="font-bold text-white block mb-1">Minimum Turnover Tax (1.25%):</span>
                    Rs. {corporateCalc.minTurnoverTax.toLocaleString()} (Companies pay higher of Normal Tax or 1.25% Turnover Tax).
                  </div>
                </div>
              )}

              {/* PROPERTY RESULTS */}
              {calcMode === 'property' && (
                <div className="space-y-4">
                  <div className="bg-[#0A4B35] p-5 rounded-2xl border border-emerald-600/30">
                    <div className="text-xs text-emerald-200 font-semibold">Buyer Withholding Tax (Sec 236K)</div>
                    <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
                      Rs. {propertyCalc.purchaseTax236K.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-[#0A4B35] p-5 rounded-2xl border border-emerald-600/30">
                    <div className="text-xs text-emerald-200 font-semibold">Seller Withholding Tax (Sec 236C)</div>
                    <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
                      Rs. {propertyCalc.saleTax236C.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SINGLE ACTION CTA BUTTON */}
            <div className="mt-8 pt-4 border-t border-emerald-700/60">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                id="calculator-whatsapp-export-btn"
                className="w-full bg-[#F5A623] hover:bg-[#E09415] text-[#1A1A1A] font-heading font-extrabold text-base py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-[#1A1A1A]" />
                <span>Discuss Calculation with Advocate on WhatsApp</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
