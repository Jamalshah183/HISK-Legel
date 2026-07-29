'use client';

import React, { useState } from 'react';
import { Send, X, Building2, CheckCircle, Clock, Shield, Download, FileText, Loader2, Award } from 'lucide-react';
import { Invoice, Client, CaseFile } from '@/types/portal';
import jsPDF from 'jspdf';

interface InvoicePdfModalProps {
  invoice: Invoice;
  client?: Client | null;
  caseFile?: CaseFile | null;
  onClose: () => void;
  onMarkPaid?: (invoiceId: string, paymentMethod?: any) => void;
}

export const InvoicePdfModal: React.FC<InvoicePdfModalProps> = ({
  invoice,
  client,
  caseFile,
  onClose,
  onMarkPaid
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const clientPhone = client?.phone || '+92 300 8551928';
  const cleanPhone = clientPhone.replace(/[^0-9]/g, '');

  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Color Definitions
      const primaryGreen = [10, 75, 53]; // #0A4B35
      const emeraldGreen = [15, 107, 76]; // #0F6B4C
      const goldAccent = [245, 166, 35]; // #F5A623
      const darkText = [26, 26, 26]; // #1A1A1A
      const grayText = [90, 98, 117]; // #5A6275
      const bgLight = [250, 250, 247]; // #FAFAF7
      const borderGray = [220, 224, 230];

      let y = 15;

      // Header Banner / Logo Box
      doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.roundedRect(14, y, 16, 16, 3, 3, 'F');

      // Inner Badge
      doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.setLineWidth(0.5);
      doc.rect(15, y + 1, 14, 14);

      doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('HK', 22, y + 11, { align: 'center' });

      // Firm Name & Subtitle
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('HISK LEGAL', 34, y + 8);

      doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.roundedRect(82, y + 3, 22, 5, 1, 1, 'F');
      doc.setTextColor(26, 26, 26);
      doc.setFontSize(7);
      doc.text('ADVOCATES', 93, y + 6.5, { align: 'center' });

      doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
      doc.setFontSize(8);
      doc.text('HIGH COURT ADVOCATES & TAX CONSULTANTS', 34, y + 13);

      // Invoice Title Right Aligned
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('OFFICIAL TAX INVOICE', 196, y + 6, { align: 'right' });

      doc.setFontSize(11);
      doc.text(invoice.invoiceNumber, 196, y + 12, { align: 'right' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('FBR NTN: 4029182-7  |  STRN: 3277876123411', 196, y + 16, { align: 'right' });

      y += 20;

      // Address Line
      doc.setFontSize(8);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('Suites 402-405, Executive Heights, Blue Area, Islamabad, Pakistan', 14, y);
      doc.text('Ph: +92 51 844 3210 | +92 300 855 1928 | Email: billing@hisklegal.com', 14, y + 4);

      y += 8;

      // Green Divider Line
      doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.setLineWidth(0.8);
      doc.line(14, y, 196, y);

      y += 6;

      // Metadata Bar
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, y, 182, 14, 2, 2, 'FD');

      const colWidth = 182 / 4;

      // Col 1: Issue Date
      doc.setFontSize(7);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('ISSUE DATE', 14 + 4, y + 5);
      doc.setFontSize(9);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(invoice.issueDate, 14 + 4, y + 10);

      // Col 2: Due Date
      doc.setFontSize(7);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('PAYMENT DUE DATE', 14 + colWidth + 4, y + 5);
      doc.setFontSize(9);
      doc.setTextColor(180, 30, 30);
      doc.text(invoice.dueDate, 14 + colWidth + 4, y + 10);

      // Col 3: Tax Year
      doc.setFontSize(7);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('TAX YEAR', 14 + colWidth * 2 + 4, y + 5);
      doc.setFontSize(9);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text(caseFile?.taxYear || '2026', 14 + colWidth * 2 + 4, y + 10);

      // Col 4: Status
      doc.setFontSize(7);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('PAYMENT STATUS', 14 + colWidth * 3 + 4, y + 5);
      doc.setFontSize(9);
      if (invoice.status === 'Paid') {
        doc.setTextColor(15, 107, 76);
      } else {
        doc.setTextColor(180, 100, 20);
      }
      doc.text(invoice.status.toUpperCase(), 14 + colWidth * 3 + 4, y + 10);

      y += 18;

      // Billed To & Legal Case Reference Cards
      const cardWidth = 88;
      const cardHeight = 36;

      // Left Card: Billed To
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(14, y, cardWidth, cardHeight, 2, 2, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text('BILLED TO (TAXPAYER / CLIENT)', 18, y + 5);

      doc.setFontSize(9.5);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      const clientNameText = doc.splitTextToSize(invoice.clientName, cardWidth - 8);
      doc.text(clientNameText, 18, y + 10);

      let clientY = y + 10 + clientNameText.length * 4;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text(`NTN Number: ${invoice.clientNtn || client?.ntn || '3918274-1'}`, 18, clientY);
      clientY += 4;
      doc.text(`CNIC / Reg: ${client?.cnic || '37405-1928374-1'}`, 18, clientY);
      clientY += 4;
      const addressText = doc.splitTextToSize(`Address: ${client?.registeredAddress || 'Blue Area, Islamabad'}`, cardWidth - 8);
      doc.text(addressText, 18, clientY);

      // Right Card: Case Ref
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(108, y, cardWidth, cardHeight, 2, 2, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text('LEGAL CASE REFERENCE', 112, y + 5);

      doc.setFontSize(9);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      const caseTitleText = doc.splitTextToSize(caseFile?.caseTitle || invoice.serviceDescription, cardWidth - 8);
      doc.text(caseTitleText, 112, y + 10);

      let caseY = y + 10 + caseTitleText.length * 4;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text(`Case Ref No: ${caseFile?.caseRef || invoice.caseId}`, 112, caseY);
      caseY += 4;
      doc.text(`Legal Forum: ${caseFile?.forum || 'Islamabad High Court (IHC)'}`, 112, caseY);
      caseY += 4;
      doc.text(`Lead Counsel: ${caseFile?.assignedCounsel || 'Adv. Hafiz Irfan Shabber Kayani'}`, 112, caseY);

      y += cardHeight + 8;

      // Table Title
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text('ITEMIZED LEGAL FEE STATEMENT', 14, y);

      y += 3;

      // Table Header
      doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.rect(14, y, 182, 7, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('#', 18, y + 5);
      doc.text('Service Description', 30, y + 5);
      doc.text('Amount (PKR)', 190, y + 5, { align: 'right' });

      y += 7;

      // Table Items
      let itemIndex = 1;

      // Row 1
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.2);

      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`0${itemIndex++}`, 18, y + 5);
      doc.text(invoice.serviceDescription, 30, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('Legal Retainer, Tax Audit Defense & Representation', 30, y + 9);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(`Rs. ${invoice.retainerFeePkr.toLocaleString()}`, 190, y + 6, { align: 'right' });

      doc.line(14, y + 12, 196, y + 12);
      y += 12;

      // Row 2 (Hearing Fee if > 0)
      if (invoice.hearingFeePkr > 0) {
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`0${itemIndex++}`, 18, y + 5);
        doc.text('High Court & Tribunal Hearing Fee', 30, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text('Per appearance fee for Senior Advocate on Cause List', 30, y + 9);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(`Rs. ${invoice.hearingFeePkr.toLocaleString()}`, 190, y + 6, { align: 'right' });

        doc.line(14, y + 12, 196, y + 12);
        y += 12;
      }

      // Row 3 (Sales Tax if > 0)
      if (invoice.salesTaxPkr > 0) {
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`0${itemIndex++}`, 18, y + 5);
        doc.text('Provincial Services Sales Tax (ICT PST 16%)', 30, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text('Statutory Tax on Legal & Professional Consultancy Services', 30, y + 9);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(`Rs. ${invoice.salesTaxPkr.toLocaleString()}`, 190, y + 6, { align: 'right' });

        doc.line(14, y + 12, 196, y + 12);
        y += 12;
      }

      // Table Totals Box
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.rect(14, y, 182, 20, 'F');
      doc.rect(14, y, 182, 20, 'S');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);

      doc.text('Subtotal Fees:', 120, y + 5);
      doc.text(`Rs. ${(invoice.retainerFeePkr + invoice.hearingFeePkr).toLocaleString()}`, 190, y + 5, { align: 'right' });

      doc.text('Sales Tax (PRA/ICT PST):', 120, y + 9);
      doc.text(`Rs. ${invoice.salesTaxPkr.toLocaleString()}`, 190, y + 9, { align: 'right' });

      doc.setLineWidth(0.4);
      doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.line(120, y + 11, 192, y + 11);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text('TOTAL AMOUNT PAYABLE:', 120, y + 16);
      doc.text(`Rs. ${invoice.totalAmountPkr.toLocaleString()}`, 190, y + 16, { align: 'right' });

      y += 26;

      // Bank Transfer Details & Terms
      doc.setFillColor(240, 248, 244);
      doc.setDrawColor(180, 220, 200);
      doc.roundedRect(14, y, 88, 28, 2, 2, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text('OFFICIAL BANK TRANSFER ACCOUNT', 18, y + 5);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text('Bank: Meezan Bank Ltd. (Islamic)', 18, y + 10);
      doc.setFont('helvetica', 'bold');
      doc.text('Title: HISK LEGAL ADVOCATES', 18, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.text('Account No: 0102-0104829103', 18, y + 18);
      doc.setFont('helvetica', 'bold');
      doc.text('IBAN: PK36 MEZN 0001 0201 0482 9103', 18, y + 22);

      // Terms Box
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(108, y, 88, 28, 2, 2, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('TERMS & INSTRUCTIONS', 112, y + 5);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(`1. Mention Invoice Ref No. ${invoice.invoiceNumber} in remarks.`, 112, y + 10);
      doc.text('2. Cheques/Pay Orders in favor of HISK LEGAL ADVOCATES.', 112, y + 14);
      doc.text('3. Send payment confirmation via WhatsApp or email.', 112, y + 18);

      y += 36;

      // Signatures
      doc.setFontSize(7);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('This is a computer-generated official tax invoice from HISK LEGAL.', 14, y + 6);
      doc.text('No manual signature required.', 14, y + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text('HISK LEGAL ADVOCATES', 196, y + 2, { align: 'right' });

      doc.setLineWidth(0.5);
      doc.line(140, y + 4, 196, y + 4);

      doc.setFontSize(8);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text('Adv. Hafiz Irfan Shabber Kayani', 196, y + 8, { align: 'right' });

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('Managing Partner & Advocate High Court', 196, y + 12, { align: 'right' });

      // Save PDF
      const cleanNum = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`HISK_Legal_Invoice_${cleanNum}.pdf`);
    } catch (e) {
      console.error('PDF generation error, fallback to print:', e);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendWhatsApp = () => {
    const message = `*HISK LEGAL ADVOCATES & CONSULTANTS*
📍 Suites 402-405, Executive Heights, Blue Area, Islamabad

*OFFICIAL LEGAL FEE INVOICE: ${invoice.invoiceNumber}*

Dear ${invoice.clientName},

Please find your official tax fee invoice details for:
📌 *Service:* ${invoice.serviceDescription}
⚖️ *Case Ref:* ${caseFile?.caseRef || invoice.caseId}
📅 *Issue Date:* ${invoice.issueDate}
⏱️ *Payment Due Date:* ${invoice.dueDate}

💰 *ITEMIZED FEE BREAKDOWN (PKR):*
• Retainer / Case Preparation: Rs. ${invoice.retainerFeePkr.toLocaleString()}
• Hearing / Appearance Fee: Rs. ${invoice.hearingFeePkr.toLocaleString()}
• Provincial Services Sales Tax: Rs. ${invoice.salesTaxPkr.toLocaleString()}
---------------------------------
*TOTAL PAYABLE AMOUNT:* *Rs. ${invoice.totalAmountPkr.toLocaleString()}*
*PAYMENT STATUS:* *${invoice.status.toUpperCase()}*

🏦 *BANK TRANSFER DETAILS:*
• Bank: Meezan Bank Ltd. (Islamic Banking)
• Account Title: HISK LEGAL ADVOCATES
• Account No: 0102-0104829103
• IBAN: PK36 MEZN 0001 0201 0482 9103

Please transfer the fee amount and share payment confirmation/receipt. Reply to this message for any queries.

Thank you for choosing HISK LEGAL!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Inject Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-pdf, #printable-invoice-pdf * {
            visibility: visible !important;
          }
          #printable-invoice-pdf {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto overflow-hidden border border-[#0F6B4C]/20 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Control Bar - Hidden on Print */}
        <div className="no-print bg-[#0A4B35] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F5A623]" />
            <h3 className="font-heading font-extrabold text-sm sm:text-base">
              Official Tax Invoice PDF — {invoice.invoiceNumber}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Send Invoice details directly to Client WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-[#F5A623] hover:bg-[#e09415] text-[#1A1A1A] font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Download official PDF file"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Save PDF</span>
                </>
              )}
            </button>

            {onMarkPaid && invoice.status !== 'Paid' && (
              <button
                onClick={() => onMarkPaid(invoice.id)}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 border border-emerald-300"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Mark Paid</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white font-bold p-1 text-lg ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable PDF Canvas Area */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-white text-[#1A1A1A]" id="printable-invoice-pdf">
          {/* Header Letterhead with Official Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-[#0A4B35] gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-[#0A4B35] rounded-xl flex items-center justify-center font-extrabold text-[#F5A623] text-sm border-2 border-[#F5A623] shadow-md shrink-0 relative">
                  <span>HK</span>
                  <Award className="w-3 h-3 text-[#F5A623] absolute -top-1 -right-1" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-heading font-extrabold text-[#0A4B35] tracking-tight">
                      HISK LEGAL
                    </h1>
                    <span className="bg-[#F5A623] text-[#1A1A1A] font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                      Advocates
                    </span>
                  </div>
                  <p className="text-[11px] font-extrabold text-[#0F6B4C] uppercase tracking-wider">
                    High Court Advocates & Tax Consultants
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 max-w-sm leading-relaxed">
                Suites 402-405, Executive Heights, Blue Area, Islamabad, Pakistan
                <br />
                Ph: +92 51 844 3210 | +92 300 855 1928 | Email: billing@hisklegal.com
              </p>
            </div>

            <div className="sm:text-right border-l-2 sm:border-l-0 sm:border-r-0 border-[#0F6B4C]/20 pl-3 sm:pl-0">
              <div className="inline-block bg-[#0A4B35]/10 text-[#0A4B35] font-extrabold text-xs px-3 py-1 rounded-md mb-2">
                OFFICIAL TAX INVOICE
              </div>
              <div className="font-mono text-base font-extrabold text-[#0A4B35]">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                FBR NTN: <span className="font-mono font-bold text-gray-900">4029182-7</span>
              </div>
              <div className="text-xs text-gray-600">
                PRA / ICT STRN: <span className="font-mono font-bold text-gray-900">3277876123411</span>
              </div>
            </div>
          </div>

          {/* Key Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 bg-[#FAFAF7] rounded-2xl border border-gray-200 my-6 p-4 text-xs">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Issue Date</span>
              <span className="font-bold text-[#1A1A1A]">{invoice.issueDate}</span>
            </div>

            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Payment Due Date</span>
              <span className="font-bold text-red-700">{invoice.dueDate}</span>
            </div>

            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Tax Year</span>
              <span className="font-bold text-[#0F6B4C]">{caseFile?.taxYear || '2026'}</span>
            </div>

            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Status</span>
              <span
                className={`inline-block font-extrabold text-[11px] px-2.5 py-0.5 rounded-md ${
                  invoice.status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Billed To & Case Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-xs">
            {/* Bill To */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] uppercase font-extrabold text-[#0F6B4C] block mb-2">
                Billed To (Taxpayer / Client)
              </span>
              <div className="font-bold text-sm text-[#1A1A1A]">{invoice.clientName}</div>
              {client?.businessName && (
                <div className="text-gray-600 font-medium">{client.businessName}</div>
              )}
              <div className="mt-2 space-y-1 text-gray-700">
                <div>
                  <span className="font-semibold">NTN Number:</span>{' '}
                  <span className="font-mono font-bold text-[#0A4B35]">
                    {invoice.clientNtn || client?.ntn || '3918274-1'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">CNIC / Reg No:</span>{' '}
                  <span className="font-mono">{client?.cnic || '37405-1928374-1'}</span>
                </div>
                <div>
                  <span className="font-semibold">Address:</span>{' '}
                  <span>{client?.registeredAddress || 'Blue Area, Islamabad, Pakistan'}</span>
                </div>
              </div>
            </div>

            {/* Case Reference */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] uppercase font-extrabold text-[#0F6B4C] block mb-2">
                Legal Case Reference
              </span>
              <div className="font-bold text-[#1A1A1A]">
                {caseFile?.caseTitle || invoice.serviceDescription}
              </div>
              <div className="mt-2 space-y-1 text-gray-700">
                <div>
                  <span className="font-semibold">Case Ref No:</span>{' '}
                  <span className="font-mono font-bold text-[#0F6B4C]">
                    {caseFile?.caseRef || invoice.caseId}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Legal Forum:</span>{' '}
                  <span>{caseFile?.forum || 'Islamabad High Court (IHC)'}</span>
                </div>
                <div>
                  <span className="font-semibold">Lead Counsel:</span>{' '}
                  <span>{caseFile?.assignedCounsel || 'Adv. Hafiz Irfan Shabber Kayani'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Fee Breakdown Table */}
          <div className="mb-6">
            <h4 className="font-heading font-extrabold text-xs text-[#0A4B35] uppercase tracking-wider mb-2">
              Itemized Legal Fee Statement
            </h4>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0A4B35] text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Service Description</th>
                    <th className="p-3 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-3 font-mono font-bold text-gray-500">01</td>
                    <td className="p-3">
                      <div className="font-bold text-[#1A1A1A]">{invoice.serviceDescription}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        Legal Retainer, Tax Audit Defense & Representation
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">
                      Rs. {invoice.retainerFeePkr.toLocaleString()}
                    </td>
                  </tr>

                  {invoice.hearingFeePkr > 0 && (
                    <tr>
                      <td className="p-3 font-mono font-bold text-gray-500">02</td>
                      <td className="p-3">
                        <div className="font-bold text-[#1A1A1A]">High Court & Tribunal Hearing Fee</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Per appearance fee for Senior Advocate on Cause List
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        Rs. {invoice.hearingFeePkr.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {invoice.salesTaxPkr > 0 && (
                    <tr>
                      <td className="p-3 font-mono font-bold text-gray-500">03</td>
                      <td className="p-3">
                        <div className="font-bold text-[#1A1A1A]">Provincial Services Sales Tax (ICT PST 16%)</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Statutory Tax on Legal & Professional Consultancy Services
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        Rs. {invoice.salesTaxPkr.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Summary Block */}
              <div className="bg-[#FAFAF7] border-t border-gray-200 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Fees:</span>
                  <span className="font-mono">
                    Rs. {(invoice.retainerFeePkr + invoice.hearingFeePkr).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Sales Tax (PRA/ICT PST):</span>
                  <span className="font-mono">Rs. {invoice.salesTaxPkr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-[#0A4B35] text-sm pt-2 border-t border-gray-300">
                  <span>TOTAL AMOUNT PAYABLE:</span>
                  <span className="font-mono text-base text-[#0A4B35]">
                    Rs. {invoice.totalAmountPkr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Payment Transfer Details & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[10px] uppercase font-extrabold text-[#0F6B4C] block mb-2">
                Official Bank Transfer Account
              </span>
              <div className="space-y-1 font-mono text-gray-800">
                <div>
                  <span className="text-gray-500 font-sans font-semibold">Bank Name:</span> Meezan Bank Ltd. (Islamic)
                </div>
                <div>
                  <span className="text-gray-500 font-sans font-semibold">Account Title:</span>{' '}
                  <span className="font-bold text-[#0A4B35]">HISK LEGAL ADVOCATES</span>
                </div>
                <div>
                  <span className="text-gray-500 font-sans font-semibold">Account No:</span> 0102-0104829103
                </div>
                <div>
                  <span className="text-gray-500 font-sans font-semibold">IBAN:</span>{' '}
                  <span className="font-bold">PK36 MEZN 0001 0201 0482 9103</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] uppercase font-extrabold text-gray-600 block mb-2">
                Terms & Instructions
              </span>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                1. Please mention Invoice Ref No. <strong className="font-mono">{invoice.invoiceNumber}</strong> in the bank transfer remarks.
                <br />
                2. Cross Cheques / Pay Orders should be issued in favor of <strong>HISK LEGAL ADVOCATES</strong>.
                <br />
                3. Send payment confirmation receipt directly via WhatsApp or email.
              </p>
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-8 mt-6 border-t flex flex-col sm:flex-row justify-between items-end gap-4 text-xs">
            <div className="text-[10px] text-gray-500 italic max-w-sm">
              This is a computer-generated official tax invoice from HISK LEGAL Law Management System. No manual signature required.
            </div>

            <div className="text-center sm:text-right">
              <div className="font-heading font-extrabold text-[#0A4B35] text-sm tracking-wide">
                HISK LEGAL ADVOCATES
              </div>
              <div className="w-48 h-0.5 bg-[#0A4B35] my-2 ml-auto" />
              <div className="text-[11px] font-bold text-gray-800">
                Adv. Hafiz Irfan Shabber Kayani
              </div>
              <div className="text-[10px] text-gray-500 font-semibold">
                Managing Partner & Advocate High Court
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar - Hidden on Print */}
        <div className="no-print bg-gray-50 border-t p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-600 font-medium">
            Recipient: <strong className="text-[#0A4B35]">{clientPhone}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Invoice via WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-[#0A4B35] hover:bg-[#0F6B4C] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F5A623]" />
                  <span>Generating PDF File...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#F5A623]" />
                  <span>Download Official PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
