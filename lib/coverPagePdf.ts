import jsPDF from 'jspdf';
import { Client, FileCategoryCode } from '@/types/portal';
import { inferClientFileCode } from '@/lib/excelExport';

interface LoadedLogoAsset {
  dataUrl: string;
  aspectRatio: number;
}

function loadImageAsDataUrl(url: string): Promise<LoadedLogoAsset | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve({
          dataUrl,
          aspectRatio: canvas.width / Math.max(1, canvas.height),
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function drawDottedLine(doc: jsPDF, x1: number, y1: number, x2: number, y2: number) {
  doc.setLineDashPattern([0.8, 0.8], 0);
  doc.setLineWidth(0.28);
  doc.setDrawColor(60, 60, 60);
  doc.line(x1, y1, x2, y2);
  doc.setLineDashPattern([], 0);
}

function getCoverLabels(client: Client, code: FileCategoryCode) {
  const volumeNo = (client.volumeNo || 'VOL-I').trim().toUpperCase();
  const fileNo = (client.fileNumber || `AI-${code}-001`).trim().toUpperCase();
  const chargeType = (client.chargeType || 'CHARGE').toUpperCase();
  const referredBy = (client.referralContact || 'HISK LEGAL').trim().toUpperCase();
  const fileName = (client.businessName || client.name || 'CLIENT FILE').trim().toUpperCase();
  const station = (client.rtoCto || client.city || 'ISLAMABAD').trim().toUpperCase();

  let subjectTitle = 'INCOME TAX';
  let subjectSubtitle = (client.coverSubjectYear || '').trim().toUpperCase();
  let identityOrNature = (client.entityStatus || '').trim().toUpperCase();

  if (code === 'IT') {
    subjectTitle = 'INCOME TAX';
    identityOrNature = (client.entityStatus || 'FREELANCER').trim().toUpperCase();
  } else if (code === 'ST') {
    subjectTitle = 'SALES TAX';
    subjectSubtitle = (client.authority || 'FBR').trim().toUpperCase();
    identityOrNature = (client.entityStatus || 'BUS IND').trim().toUpperCase();
  } else if (code === 'INC') {
    subjectTitle = 'Incorporation Files';
    subjectSubtitle = (client.coverSubjectYear || '').trim().toUpperCase();
    identityOrNature = (client.entityStatus || 'COMPANY').trim().toUpperCase();
  } else if (code === 'CF') {
    subjectTitle = 'COURT FILES';
    subjectSubtitle = (client.pendingBeforeCourt || 'ISLAMABAD HIGH COURT').trim().toUpperCase();
    identityOrNature = (client.natureOfCase || '').trim().toUpperCase();
  }

  return {
    volumeNo,
    fileNo,
    chargeType,
    referredBy,
    fileName,
    station,
    subjectTitle,
    subjectSubtitle,
    identityOrNature,
  };
}

export async function generateClientCoverPagePdfDoc(client: Client): Promise<jsPDF> {
  const code = inferClientFileCode(client);
  const labels = getCoverLabels(client, code);

  // Exact A4 portrait (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const [hiskLogo, asifLogo] = await Promise.all([
    loadImageAsDataUrl('/images/logo-transparent.png'),
    loadImageAsDataUrl('/images/logo-secondary-transparent.png'),
  ]);

  const pageWidth = 210;
  const marginX = 10;
  const contentW = pageWidth - marginX * 2; // 190mm

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  // --- BAND 1: TOP TWO BOXES (VOL-I & FILE NO.) ---
  const topBoxY = 11;
  const topBoxH = 22;
  const volBoxW = 60;
  const fileBoxW = 78;
  const fileBoxX = pageWidth - marginX - fileBoxW; // 122mm

  doc.setLineWidth(0.65);
  doc.rect(marginX, topBoxY, volBoxW, topBoxH);
  doc.rect(fileBoxX, topBoxY, fileBoxW, topBoxH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(labels.volumeNo, marginX + volBoxW / 2, topBoxY + topBoxH / 2 + 3.2, { align: 'center' });

  let fileFontSize = 27;
  doc.setFontSize(fileFontSize);
  while (doc.getTextWidth(labels.fileNo) > fileBoxW - 6 && fileFontSize > 16) {
    fileFontSize -= 1;
    doc.setFontSize(fileFontSize);
  }
  doc.text(labels.fileNo, fileBoxX + fileBoxW / 2, topBoxY + topBoxH / 2 + fileFontSize * 0.11, {
    align: 'center',
  });

  // --- BAND 2: MAIN CENTER COVER FRAME ---
  const frameY = 37;
  const frameH = 152; // ends at y = 189mm
  doc.setLineWidth(0.75);
  doc.rect(marginX, frameY, contentW, frameH);

  // 2A. Subject & Authority / Court Name Header (right-aligned inside frame)
  const rightPadX = marginX + contentW - 4; // 196mm
  doc.setFont('helvetica', 'bold');
  let subjectSize = code === 'INC' ? 31 : 34;
  doc.setFontSize(subjectSize);
  while (doc.getTextWidth(labels.subjectTitle) > contentW - 12 && subjectSize > 20) {
    subjectSize -= 1;
    doc.setFontSize(subjectSize);
  }
  doc.text(labels.subjectTitle, rightPadX, frameY + 16, { align: 'right' });

  if (labels.subjectSubtitle) {
    let subSize = code === 'CF' ? 21 : 24;
    doc.setFontSize(subSize);
    const subLines = doc.splitTextToSize(labels.subjectSubtitle, contentW - 14) as string[];
    while (subLines.length > 2 && subSize > 13) {
      subSize -= 1;
      doc.setFontSize(subSize);
    }
    const fittedSubLines = (doc.splitTextToSize(labels.subjectSubtitle, contentW - 14) as string[]).slice(0, 2);
    doc.text(fittedSubLines, rightPadX, frameY + (fittedSubLines.length > 1 ? 24.5 : 29), {
      align: 'right',
    });
  }

  // Divider 1 (below Subject block)
  const div1Y = 72;
  drawDottedLine(doc, marginX + 1, div1Y, marginX + contentW - 1, div1Y);

  // 2B. Hero Name of File (large centered bold) + Type / Nature & Station (right-aligned normal)
  doc.setFont('helvetica', 'bold');
  let nameSize = 27;
  doc.setFontSize(nameSize);
  let nameLines = doc.splitTextToSize(labels.fileName, contentW - 14) as string[];
  while (nameLines.length > 2 && nameSize > 16) {
    nameSize -= 1;
    doc.setFontSize(nameSize);
    nameLines = doc.splitTextToSize(labels.fileName, contentW - 14) as string[];
  }
  if (nameLines.length > 3) {
    nameLines = nameLines.slice(0, 3);
  }
  const nameStartY = nameLines.length === 1 ? 97 : nameLines.length === 2 ? 90 : 84;
  const lineGap = nameSize * 0.42;
  nameLines.forEach((line, i) => {
    doc.text(line, pageWidth / 2, nameStartY + i * lineGap, { align: 'center' });
  });

  // Sub-lines (Identity/Nature + Station) right-aligned matching screenshots
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(19);
  if (labels.identityOrNature) {
    let idSize = 19;
    while (doc.getTextWidth(labels.identityOrNature) > contentW - 12 && idSize > 12) {
      idSize -= 1;
      doc.setFontSize(idSize);
    }
    doc.text(labels.identityOrNature, rightPadX, 126, { align: 'right' });
  }
  if (labels.station) {
    let stSize = 19;
    doc.setFontSize(stSize);
    while (doc.getTextWidth(labels.station) > contentW - 12 && stSize > 12) {
      stSize -= 1;
      doc.setFontSize(stSize);
    }
    doc.text(labels.station, rightPadX, 141, { align: 'right' });
  }

  // Divider 2 (above CNIC / NTN strip)
  const div2Y = 148;
  drawDottedLine(doc, marginX + 1, div2Y, marginX + contentW - 1, div2Y);

  // 2C. CNIC/PP NO & NTN Strip
  const idRowY = 156.5;
  const cleanCnic = (client.cnic || '').trim();
  const cleanNtn = (client.ntn || '').trim();

  if (code !== 'CF' || cleanCnic) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CNIC/PP NO', marginX + 3, idRowY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13.5);
    doc.text(cleanCnic || (code === 'INC' ? '' : '-'), marginX + 33, idRowY);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('NTN:', 121, idRowY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13.5);
  doc.text(cleanNtn || '-', 135, idRowY);

  // Divider 3 (above Contacts grid)
  const div3Y = 161;
  drawDottedLine(doc, marginX + 1, div3Y, marginX + contentW - 1, div3Y);

  // 2D. Two-Row Contacts Grid inside the bottom of the main frame
  const drawFittedContactVal = (val: string, x: number, y: number, maxW: number, startSize = 8.5) => {
    let sz = startSize;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(sz);
    while (doc.getTextWidth(val) > maxW && sz > 6) {
      sz -= 0.5;
      doc.setFontSize(sz);
    }
    doc.text(val, x, y);
  };

  const cp1 = (client.contactPerson || '-').trim().toUpperCase();
  const cp1Wa = (client.whatsapp || client.phone || '-').trim();
  const cp1Email = (client.email || '-').trim();

  const cp2 = (client.contactPerson2 || '-').trim().toUpperCase();
  const cp2Wa = (client.whatsapp2 || '-').trim();
  const cp2Email = (client.email2 || '-').trim();

  // Contact Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Contact Person:', marginX + 3, 166.2);
  drawFittedContactVal(cp1, marginX + 34, 166.2, 76);
  if (client.landline?.trim()) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Landline: ${client.landline.trim()}`, marginX + 34, 171.2);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('WhatsApp:', 114, 166.2);
  drawFittedContactVal(cp1Wa, 134, 166.2, 63);
  doc.setFontSize(8.5);
  doc.text('Email:', 114, 171.8);
  drawFittedContactVal(cp1Email, 134, 171.8, 63);

  // Divider 4 (between Contact 1 and Contact 2)
  const div4Y = 175;
  drawDottedLine(doc, marginX + 1, div4Y, marginX + contentW - 1, div4Y);

  // Contact Row 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Contact Person (2):', marginX + 3, 180.2);
  drawFittedContactVal(cp2, marginX + 34, 180.2, 76);

  doc.setFontSize(8.5);
  doc.text('WhatsApp:', 114, 180.2);
  drawFittedContactVal(cp2Wa, 134, 180.2, 63);
  doc.setFontSize(8.5);
  doc.text('Email:', 114, 185.8);
  drawFittedContactVal(cp2Email, 134, 185.8, 63);

  // --- BAND 3: SPINE CUTOUTS, CHARGE/REFERRAL, DUAL LOGOS & FIRM FOOTER ---
  // Top-left small VOL-I spine box
  const smallVolX = marginX;
  const smallVolY = 194.5;
  const smallVolW = 36;
  const smallVolH = 15.5;
  doc.setLineWidth(0.55);
  doc.rect(smallVolX, smallVolY, smallVolW, smallVolH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(labels.volumeNo, smallVolX + smallVolW / 2, smallVolY + smallVolH / 2 + 2.2, {
    align: 'center',
  });

  // Charge / Complementary & Referred By underlined rows
  const metaLabelX = 112;
  const metaValueX = 117;
  const metaLineEndX = 172;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('To be charged or Complementary:', metaLabelX, 200, { align: 'right' });
  doc.text(labels.chargeType, metaValueX, 200);
  doc.setLineWidth(0.35);
  doc.line(metaValueX - 1, 201.3, metaLineEndX, 201.3);

  doc.text('Referred By:', metaLabelX, 210, { align: 'right' });
  doc.text(labels.referredBy, metaValueX, 210);
  doc.line(metaValueX - 1, 211.3, metaLineEndX, 211.3);

  // Bottom-left Vertical Rotated File No. Spine Box (90 deg counterclockwise)
  const spineX = marginX;
  const spineY = 216;
  const spineW = 36;
  const spineH = 69; // ends at y = 285mm
  doc.setLineWidth(0.6);
  doc.rect(spineX, spineY, spineW, spineH);

  let spineFontSize = 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(spineFontSize);
  while (doc.getTextWidth(labels.fileNo) > spineH - 8 && spineFontSize > 14) {
    spineFontSize -= 1;
    doc.setFontSize(spineFontSize);
  }
  const spineTextWidth = doc.getTextWidth(labels.fileNo);
  const spineCenterX = spineX + spineW / 2 + spineFontSize * 0.12;
  const spineStartY = spineY + spineH / 2 + spineTextWidth / 2;
  doc.text(labels.fileNo, spineCenterX, spineStartY, { angle: 90 });

  // Dual Firm Logos (Side by Side)
  const logoAreaY = 220;
  const logoMaxH = 36;

  if (hiskLogo) {
    let w = logoMaxH * hiskLogo.aspectRatio;
    let h = logoMaxH;
    if (w > 56) {
      w = 56;
      h = w / hiskLogo.aspectRatio;
    }
    const yOffset = logoAreaY + (logoMaxH - h) / 2;
    doc.addImage(hiskLogo.dataUrl, 'PNG', 68, yOffset, w, h);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('HISK LEGAL', 94, 240, { align: 'center' });
  }

  if (asifLogo) {
    let w = logoMaxH * asifLogo.aspectRatio;
    let h = logoMaxH;
    if (w > 54) {
      w = 54;
      h = w / asifLogo.aspectRatio;
    }
    const yOffset = logoAreaY + (logoMaxH - h) / 2;
    doc.addImage(asifLogo.dataUrl, 'PNG', 132, yOffset, w, h);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Asif Farid & Co. LLP', 158, 240, { align: 'center' });
  }

  // Office Address & Contact Block centered below logos
  const footerCenterX = 128;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('No. 10, 2nd Floor, Awan Plaza, G-8 Markaz, Islamabad', footerCenterX, 265, {
    align: 'center',
  });
  doc.text('Cell: 0333-5216978 (Asif), 0314-5113670 (Irfan)', footerCenterX, 270.5, {
    align: 'center',
  });
  doc.text('Tel: 051 6124100; WhatsApp: 051 6214100', footerCenterX, 276, {
    align: 'center',
  });

  return doc;
}

export async function downloadClientCoverPagePdf(client: Client) {
  const doc = await generateClientCoverPagePdfDoc(client);
  const code = inferClientFileCode(client);
  const safeFileNo = (client.fileNumber || `AI-${code}-001`)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '_');
  const safeName = (client.businessName || client.name || 'Client')
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  doc.save(`${safeFileNo}_${safeName}_Cover_A4.pdf`);
}
