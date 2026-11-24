import ExcelJS from 'exceljs';
import { CaseFile, Client, ClientType, ClientVaultSecret, FileCategoryCode } from '@/types/portal';

export interface FileCategoryMeta {
  code: FileCategoryCode;
  prefix: string;
  label: string;
  shortLabel: string;
  clientType: ClientType;
  sheetKind: 'IT' | 'ST' | 'INC' | 'CF';
  description: string;
}

export const FILE_CATEGORY_CONFIG: Record<FileCategoryCode, FileCategoryMeta> = {
  IT: {
    code: 'IT',
    prefix: 'AI-IT-',
    label: 'Income Tax (AI-IT)',
    shortLabel: 'Income Tax',
    clientType: 'Tax Client',
    sheetKind: 'IT',
    description: 'Income Tax compliance, returns, and IRIS filings (INCOME TAX CLIETS sheet)',
  },
  ST: {
    code: 'ST',
    prefix: 'AI-ST-',
    label: 'Sales Tax (AI-ST)',
    shortLabel: 'Sales Tax',
    clientType: 'Tax Client',
    sheetKind: 'ST',
    description: 'Sales Tax registration, monthly returns, FBR/PRA/KPRA/SRB/BRA (SALES TAX CLIENTS sheet)',
  },
  INC: {
    code: 'INC',
    prefix: 'AI-INC-',
    label: 'Incorporation — AOP / NPO / Company (AI-INC)',
    shortLabel: 'Incorporation',
    clientType: 'Other Category',
    sheetKind: 'INC',
    description: 'AOP, NPO, and SECP Company registrations (AOP/NPO/COMPANY CLIENT FILES sheet)',
  },
  CF: {
    code: 'CF',
    prefix: 'AI-CF-',
    label: 'Court File (AI-CF)',
    shortLabel: 'Court File',
    clientType: 'Other Category',
    sheetKind: 'CF',
    description: 'High Court & Civil/Criminal court litigation files (COURT CASES FILES sheet)',
  },
};

export const ALL_FILE_CATEGORY_CODES: FileCategoryCode[] = ['IT', 'ST', 'INC', 'CF'];

export function parseFileCodeFromFileNumber(fileNumber?: string | null): FileCategoryCode | null {
  if (!fileNumber) return null;
  const upper = fileNumber.trim().toUpperCase();
  if (upper.startsWith('AI-IT-') || /^IT-\d+/i.test(upper)) return 'IT';
  if (upper.startsWith('AI-ST-') || /^ST-\d+/i.test(upper)) return 'ST';
  if (upper.startsWith('AI-INC-') || /^INC-\d+/i.test(upper)) return 'INC';
  if (upper.startsWith('AI-CF-') || /^CF-\d+/i.test(upper)) return 'CF';
  return null;
}

export function inferClientFileCode(client?: Client | null): FileCategoryCode {
  if (!client) return 'IT';
  if (client.fileCategoryCode && FILE_CATEGORY_CONFIG[client.fileCategoryCode]) {
    return client.fileCategoryCode;
  }
  const fromNum = parseFileCodeFromFileNumber(client.fileNumber);
  if (fromNum) return fromNum;

  const cat = (client.category || '').toLowerCase();
  if (cat.includes('sales tax') || cat === 'sales tax (st)') return 'ST';
  if (cat.includes('income tax') || cat === 'income tax (it)' || cat === 'tax client') return 'IT';
  if (cat.includes('incorporation') || cat.includes('corporate') || cat.includes('aop') || cat.includes('npo')) {
    return client.clientType === 'Tax Client' ? 'IT' : 'INC';
  }
  if (
    cat.includes('court') ||
    cat.includes('civil') ||
    cat.includes('criminal') ||
    cat.includes('family') ||
    cat.includes('rent') ||
    cat.includes('banking') ||
    cat.includes('other')
  ) {
    return 'CF';
  }
  if (client.clientType === 'Other Category') return 'INC';
  return 'IT';
}

export function getClientTypeFromFileCode(code: FileCategoryCode): ClientType {
  return FILE_CATEGORY_CONFIG[code].clientType;
}

export function getDefaultClientCategoryForFileCode(code: FileCategoryCode) {
  switch (code) {
    case 'IT':
      return 'Income Tax (IT)' as const;
    case 'ST':
      return 'Sales Tax (ST)' as const;
    case 'INC':
      return 'Incorporation (INC)' as const;
    case 'CF':
      return 'Court File (CF)' as const;
  }
}

export function getNextFileNumber(
  code: FileCategoryCode,
  clients: Client[],
  cases: CaseFile[] = []
): string {
  const regex = new RegExp(`^AI-${code}-(\\d+)$`, 'i');
  let maxNum = 0;

  clients.forEach((c) => {
    const fn = c.fileNumber?.trim() || '';
    const match = fn.match(regex);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n) && n > maxNum) maxNum = n;
    }
  });

  cases.forEach((cs) => {
    [cs.fileNumber, cs.caseRef].forEach((val) => {
      const fn = val?.trim() || '';
      const match = fn.match(regex);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!Number.isNaN(n) && n > maxNum) maxNum = n;
      }
    });
  });

  const next = maxNum + 1;
  return `AI-${code}-${String(next).padStart(3, '0')}`;
}

export function sortByFileNumber<T extends { fileNumber?: string; createdAt?: string }>(items: T[]): T[] {
  const orderWeight: Record<FileCategoryCode, number> = { IT: 1, ST: 2, INC: 3, CF: 4 };
  return [...items].sort((a, b) => {
    const codeA = parseFileCodeFromFileNumber(a.fileNumber) || 'IT';
    const codeB = parseFileCodeFromFileNumber(b.fileNumber) || 'IT';
    if (orderWeight[codeA] !== orderWeight[codeB]) {
      return orderWeight[codeA] - orderWeight[codeB];
    }
    const matchA = (a.fileNumber || '').match(/-(\d+)$/);
    const matchB = (b.fileNumber || '').match(/-(\d+)$/);
    const numA = matchA ? parseInt(matchA[1], 10) : parseInt((a.fileNumber || '').replace(/\D+/g, ''), 10) || 9999;
    const numB = matchB ? parseInt(matchB[1], 10) : parseInt((b.fileNumber || '').replace(/\D+/g, ''), 10) || 9999;
    if (numA !== numB) return numA - numB;
    return (a.fileNumber || '').localeCompare(b.fileNumber || '');
  });
}

const THIN_BLACK_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } },
};

function applyBorderRange(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  colCount: number
) {
  for (let r = startRow; r <= endRow; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= colCount; c++) {
      row.getCell(c).border = THIN_BLACK_BORDER;
    }
  }
}

function getUniqueSortedFileNo(
  rawFileNo: string | undefined,
  code: FileCategoryCode,
  usedSet: Set<string>,
  counterRef: { value: number }
): string {
  let fileNo = rawFileNo?.trim().toUpperCase() || '';
  if (!fileNo) {
    while (usedSet.has(`AI-${code}-${String(counterRef.value).padStart(3, '0')}`)) {
      counterRef.value += 1;
    }
    fileNo = `AI-${code}-${String(counterRef.value).padStart(3, '0')}`;
    usedSet.add(fileNo);
    counterRef.value += 1;
  }
  return fileNo;
}

// 1. INCOME TAX CLIETS SHEET (12 columns exact match)
export function buildIncomeTaxSheet(
  workbook: ExcelJS.Workbook,
  tabName: string,
  clients: Client[],
  secretsMap: Record<string, ClientVaultSecret>
) {
  const sheet = workbook.addWorksheet(tabName, {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  sheet.columns = [
    { key: 'fileNo', width: 13 },
    { key: 'name', width: 38 },
    { key: 'activeClosed', width: 12 },
    { key: 'status', width: 16 },
    { key: 'cnic', width: 18 },
    { key: 'ntn', width: 15 },
    { key: 'irisPw', width: 16 },
    { key: 'rtoCto', width: 18 },
    { key: 'contactPerson', width: 24 },
    { key: 'email', width: 28 },
    { key: 'mobileNo', width: 16 },
    { key: 'referralContact', width: 26 },
  ];

  // Row 1: Title Banner
  sheet.mergeCells('A1:L1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'INCOME TAX CLIETS';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  // Row 2 & Row 3: Exact headers matching IT screenshot
  sheet.mergeCells('A2:A3');
  sheet.getCell('A2').value = 'File No.';

  sheet.mergeCells('B2:B3');
  sheet.getCell('B2').value = 'Name of Business/Individual';

  sheet.mergeCells('C2:C3');
  sheet.getCell('C2').value = 'Active/\nClosed';

  sheet.mergeCells('D2:D3');
  sheet.getCell('D2').value = 'Status';

  sheet.mergeCells('E2:E3');
  sheet.getCell('E2').value = 'CNIC';

  sheet.mergeCells('F2:F3');
  sheet.getCell('F2').value = 'NTN';

  sheet.mergeCells('G2:G3');
  sheet.getCell('G2').value = 'IRIS PW';

  sheet.mergeCells('H2:H3');
  sheet.getCell('H2').value = 'RTO/CTO';

  sheet.mergeCells('I2:I3');
  sheet.getCell('I2').value = 'Contact Person';

  sheet.mergeCells('J2:K2');
  sheet.getCell('J2').value = 'Contacts';
  sheet.getCell('J3').value = 'E-mail address';
  sheet.getCell('K3').value = 'Mobile No.';

  sheet.mergeCells('L2:L3');
  sheet.getCell('L2').value = 'REFERRAL CONTACT';

  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 20;

  for (let r = 2; r <= 3; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = THIN_BLACK_BORDER;
    }
  }

  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: 12 },
  };

  const itClients = sortByFileNumber(clients.filter((cl) => inferClientFileCode(cl) === 'IT'));
  const usedSet = new Set(
    itClients.map((c) => c.fileNumber?.trim().toUpperCase()).filter((v): v is string => Boolean(v))
  );
  const counterRef = { value: 1 };

  const minRows = Math.max(itClients.length, 10);
  for (let idx = 0; idx < minRows; idx++) {
    const rowIndex = 4 + idx;
    const row = sheet.getRow(rowIndex);
    row.height = 19;

    if (idx < itClients.length) {
      const client = itClients[idx];
      const secret = secretsMap[client.id];
      const fileNo = getUniqueSortedFileNo(client.fileNumber, 'IT', usedSet, counterRef);
      const activeClosedVal =
        client.activeClosed || (client.status === 'Archived' ? 'Closed' : 'Active');

      row.getCell(1).value = fileNo;
      row.getCell(2).value = client.businessName || client.name || '';
      row.getCell(3).value = activeClosedVal;
      row.getCell(4).value = client.entityStatus || 'INDIVIDUAL';
      row.getCell(5).value = client.cnic || '';
      row.getCell(6).value = client.ntn || '';
      row.getCell(7).value = secret?.irisPassword || '';
      row.getCell(8).value = (client.rtoCto || client.city || '').toUpperCase();
      row.getCell(9).value = client.contactPerson || '';
      row.getCell(10).value = client.email || '';
      row.getCell(11).value = client.phone || '';
      row.getCell(12).value = client.referralContact || '';
    }

    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
      cell.alignment = { horizontal: c === 2 ? 'left' : 'center', vertical: 'middle' };
      cell.border = THIN_BLACK_BORDER;
    }
  }

  applyBorderRange(sheet, 2, 3 + minRows, 12);
  return sheet;
}

// 2. SALES TAX CLIENTS SHEET (13 columns exact match)
export function buildSalesTaxSheet(
  workbook: ExcelJS.Workbook,
  tabName: string,
  clients: Client[],
  secretsMap: Record<string, ClientVaultSecret>
) {
  const sheet = workbook.addWorksheet(tabName, {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  sheet.columns = [
    { key: 'fileNo', width: 13 },
    { key: 'name', width: 38 },
    { key: 'activeClosed', width: 12 },
    { key: 'status', width: 14 },
    { key: 'authority', width: 26 },
    { key: 'cnicLoginId', width: 18 },
    { key: 'ntn', width: 15 },
    { key: 'fbrPstPw', width: 16 },
    { key: 'rtoCto', width: 18 },
    { key: 'contactPerson', width: 24 },
    { key: 'email', width: 28 },
    { key: 'mobileNo', width: 16 },
    { key: 'referralContact', width: 30 },
  ];

  sheet.mergeCells('A1:M1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'SALES TAX CLIENTS';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  sheet.mergeCells('A2:A3');
  sheet.getCell('A2').value = 'File No.';

  sheet.mergeCells('B2:B3');
  sheet.getCell('B2').value = 'Name of Business/Individual';

  sheet.mergeCells('C2:C3');
  sheet.getCell('C2').value = 'Active/\nClosed';

  sheet.mergeCells('D2:D3');
  sheet.getCell('D2').value = 'Status';

  sheet.mergeCells('E2:E3');
  sheet.getCell('E2').value = 'Authority (FBR/PRA/KPRA/SRB/BRA)';

  sheet.mergeCells('F2:F3');
  sheet.getCell('F2').value = 'CNIC / Login ID';

  sheet.mergeCells('G2:G3');
  sheet.getCell('G2').value = 'NTN';

  sheet.mergeCells('H2:H3');
  sheet.getCell('H2').value = 'FBR/PST PW';

  sheet.mergeCells('I2:I3');
  sheet.getCell('I2').value = 'RTO/CTO';

  sheet.mergeCells('J2:J3');
  sheet.getCell('J2').value = 'Contact Person';

  sheet.mergeCells('K2:L2');
  sheet.getCell('K2').value = 'Contacts';
  sheet.getCell('K3').value = 'E-mail address';
  sheet.getCell('L3').value = 'Mobile No.';

  sheet.mergeCells('M2:M3');
  sheet.getCell('M2').value = 'REFERRAL CONTACT';

  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 20;

  for (let r = 2; r <= 3; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= 13; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = THIN_BLACK_BORDER;
    }
  }

  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: 13 },
  };

  const stClients = sortByFileNumber(clients.filter((cl) => inferClientFileCode(cl) === 'ST'));
  const usedSet = new Set(
    stClients.map((c) => c.fileNumber?.trim().toUpperCase()).filter((v): v is string => Boolean(v))
  );
  const counterRef = { value: 1 };

  const minRows = Math.max(stClients.length, 10);
  for (let idx = 0; idx < minRows; idx++) {
    const rowIndex = 4 + idx;
    const row = sheet.getRow(rowIndex);
    row.height = 19;

    if (idx < stClients.length) {
      const client = stClients[idx];
      const secret = secretsMap[client.id];
      const fileNo = getUniqueSortedFileNo(client.fileNumber, 'ST', usedSet, counterRef);
      const activeClosedVal =
        client.activeClosed || (client.status === 'Archived' ? 'Closed' : 'Active');

      row.getCell(1).value = fileNo;
      row.getCell(2).value = client.businessName || client.name || '';
      row.getCell(3).value = activeClosedVal;
      row.getCell(4).value = client.entityStatus || 'BUS IND';
      row.getCell(5).value = (client.authority || 'FBR').toUpperCase();
      row.getCell(6).value = client.cnic || '';
      row.getCell(7).value = client.ntn || '';
      row.getCell(8).value = secret?.fbrPstPassword || '';
      row.getCell(9).value = (client.rtoCto || client.city || '').toUpperCase();
      row.getCell(10).value = client.contactPerson || '';
      row.getCell(11).value = client.email || '';
      row.getCell(12).value = client.phone || '';
      row.getCell(13).value = client.referralContact || '';
    }

    for (let c = 1; c <= 13; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
      cell.alignment = { horizontal: c === 2 ? 'left' : 'center', vertical: 'middle' };
      cell.border = THIN_BLACK_BORDER;
    }
  }

  applyBorderRange(sheet, 2, 3 + minRows, 13);
  return sheet;
}

// 3. AOP/NPO/COMPANY CLIENT FILES SHEET (14 columns exact match)
export function buildIncFormatSheet(
  workbook: ExcelJS.Workbook,
  tabName: string,
  titleBanner: string,
  rowsData: Array<{
    client: Client;
    secret?: ClientVaultSecret;
  }>
) {
  const sheet = workbook.addWorksheet(tabName, {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  sheet.columns = [
    { key: 'fileNo', width: 13 },
    { key: 'businessName', width: 44 },
    { key: 'activeClosed', width: 12 },
    { key: 'status', width: 14 },
    { key: 'cnicLoginId', width: 18 },
    { key: 'regIncorpNo', width: 17 },
    { key: 'ntn', width: 15 },
    { key: 'secpPassword', width: 16 },
    { key: 'secpPin', width: 13 },
    { key: 'rtoCto', width: 16 },
    { key: 'contactPerson', width: 20 },
    { key: 'email', width: 28 },
    { key: 'mobileNo', width: 16 },
    { key: 'referralContact', width: 22 },
  ];

  sheet.mergeCells('A1:N1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = titleBanner;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  sheet.mergeCells('A2:A3');
  sheet.getCell('A2').value = 'File No.';

  sheet.mergeCells('B2:B3');
  sheet.getCell('B2').value = 'Name of Business';

  sheet.mergeCells('C2:C3');
  sheet.getCell('C2').value = 'Active/\nClosed';

  sheet.mergeCells('D2:D3');
  sheet.getCell('D2').value = 'Status';

  sheet.getCell('E2').value = '';
  sheet.getCell('E3').value = 'CNIC / Login ID';

  sheet.mergeCells('F2:F3');
  sheet.getCell('F2').value = 'Reg./Incorp. No.';

  sheet.mergeCells('G2:G3');
  sheet.getCell('G2').value = 'NTN';

  sheet.getCell('H2').value = '';
  sheet.getCell('H3').value = 'SECP Password';

  sheet.getCell('I2').value = '';
  sheet.getCell('I3').value = 'SECP PIN';

  sheet.mergeCells('J2:J3');
  sheet.getCell('J2').value = 'RTO/CTO';

  sheet.mergeCells('K2:K3');
  sheet.getCell('K2').value = 'Contact Person';

  sheet.mergeCells('L2:M2');
  sheet.getCell('L2').value = 'Contacts';
  sheet.getCell('L3').value = 'E-mail address';
  sheet.getCell('M3').value = 'Mobile No.';

  sheet.mergeCells('N2:N3');
  sheet.getCell('N2').value = 'REFERRAL CONTACT';

  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 20;

  for (let r = 2; r <= 3; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= 14; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = THIN_BLACK_BORDER;
    }
  }

  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: 14 },
  };

  const sorted = sortByFileNumber(
    rowsData.map((r) => ({ ...r, fileNumber: r.client.fileNumber }))
  );

  const usedIncFileNos = new Set(
    sorted
      .map((r) => r.client.fileNumber?.trim().toUpperCase())
      .filter((v): v is string => Boolean(v))
  );
  const counterRef = { value: 1 };

  const minRows = Math.max(sorted.length, 10);
  for (let idx = 0; idx < minRows; idx++) {
    const rowIndex = 4 + idx;
    const row = sheet.getRow(rowIndex);
    row.height = 19;

    if (idx < sorted.length) {
      const { client, secret } = sorted[idx];
      const code = inferClientFileCode(client);
      const fallbackFileNo = getUniqueSortedFileNo(client.fileNumber, code, usedIncFileNos, counterRef);
      const activeClosedVal =
        client.activeClosed || (client.status === 'Archived' ? 'Closed' : 'Active');

      row.getCell(1).value = fallbackFileNo;
      row.getCell(2).value = client.businessName || client.name || '';
      row.getCell(3).value = activeClosedVal;
      row.getCell(4).value = client.entityStatus || client.category || '';
      row.getCell(5).value = client.cnic || '';
      row.getCell(6).value = client.regIncorpNo || '';
      row.getCell(7).value = client.ntn || '';
      row.getCell(8).value = secret?.secpPassword || '';
      row.getCell(9).value = secret?.secpPin || '';
      row.getCell(10).value = (client.rtoCto || client.city || '').toUpperCase();
      row.getCell(11).value = client.contactPerson || '';
      row.getCell(12).value = client.email || '';
      row.getCell(13).value = client.phone || '';
      row.getCell(14).value = client.referralContact || '';
    }

    for (let c = 1; c <= 14; c++) {
      const cell = row.getCell(c);
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: c <= 4 || c >= 6,
        color: { argb: 'FF000000' },
      };
      cell.alignment = {
        horizontal: c === 2 ? 'left' : 'center',
        vertical: 'middle',
        wrapText: false,
      };
      cell.border = THIN_BLACK_BORDER;
    }
  }

  applyBorderRange(sheet, 2, 3 + minRows, 14);
  return sheet;
}

// 4. COURT CASES FILES SHEET (7 columns exact match)
export function buildCourtCasesSheet(
  workbook: ExcelJS.Workbook,
  tabName: string,
  clients: Client[],
  cases: CaseFile[]
) {
  const sheet = workbook.addWorksheet(tabName, {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  sheet.columns = [
    { key: 'fileNo', width: 13 },
    { key: 'clientName', width: 48 },
    { key: 'court', width: 28 },
    { key: 'contactPerson', width: 22 },
    { key: 'status', width: 18 },
    { key: 'mobileNo', width: 18 },
    { key: 'referralContact', width: 28 },
  ];

  sheet.mergeCells('A1:G1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'COURT CASES FILES';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  sheet.mergeCells('A2:A3');
  sheet.getCell('A2').value = 'File No.';

  sheet.mergeCells('B2:B3');
  sheet.getCell('B2').value = 'Name of Client';

  sheet.mergeCells('C2:C3');
  sheet.getCell('C2').value = 'Pending Before Court of Law';

  sheet.mergeCells('D2:D3');
  sheet.getCell('D2').value = 'Contact Person';

  sheet.mergeCells('E2:F2');
  sheet.getCell('E2').value = 'Contacts';
  sheet.getCell('E3').value = 'Status';
  sheet.getCell('F3').value = 'Mobile No.';

  sheet.mergeCells('G2:G3');
  sheet.getCell('G2').value = 'REFERRAL CONTACT';

  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 20;

  for (let r = 2; r <= 3; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = THIN_BLACK_BORDER;
    }
  }

  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: 7 },
  };

  const cfClients = sortByFileNumber(
    clients.filter((cl) => inferClientFileCode(cl) === 'CF')
  );

  const usedCfFileNos = new Set(
    cfClients
      .map((c) => c.fileNumber?.trim().toUpperCase())
      .filter((v): v is string => Boolean(v))
  );
  const counterRef = { value: 1 };

  const minRows = Math.max(cfClients.length, 10);
  for (let idx = 0; idx < minRows; idx++) {
    const rowIndex = 4 + idx;
    const row = sheet.getRow(rowIndex);
    row.height = 19;

    if (idx < cfClients.length) {
      const client = cfClients[idx];
      const linkedCase = cases.find((cs) => cs.clientId === client.id);
      const fileNo = getUniqueSortedFileNo(client.fileNumber, 'CF', usedCfFileNos, counterRef);
      const courtName = client.pendingBeforeCourt || linkedCase?.forum || '';
      const activeStatus =
        client.activeClosed || (client.status === 'Archived' ? 'Closed' : 'Active');

      row.getCell(1).value = fileNo;
      row.getCell(2).value = client.name || '';
      row.getCell(3).value = courtName;
      row.getCell(4).value = client.contactPerson || '';
      row.getCell(5).value = activeStatus;
      row.getCell(6).value = client.phone || '';
      row.getCell(7).value = client.referralContact || '';
    }

    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c);
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FF000000' },
      };
      cell.alignment = {
        horizontal: c === 2 ? 'left' : 'center',
        vertical: 'middle',
      };
      cell.border = THIN_BLACK_BORDER;
    }
  }

  applyBorderRange(sheet, 2, 3 + minRows, 7);
  return sheet;
}

async function triggerExcelDownload(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildMasterExcelWorkbook(
  clients: Client[],
  cases: CaseFile[],
  secretsMap: Record<string, ClientVaultSecret>
): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HISK LEGAL Portal';
  workbook.created = new Date();

  buildIncomeTaxSheet(workbook, 'INCOME TAX CLIENTS (IT)', clients, secretsMap);
  buildSalesTaxSheet(workbook, 'SALES TAX CLIENTS (ST)', clients, secretsMap);

  const incClients = sortByFileNumber(
    clients.filter((cl) => inferClientFileCode(cl) === 'INC')
  );
  buildIncFormatSheet(
    workbook,
    'AOP_NPO_COMPANY (INC)',
    'AOP/NPO/COMPANY CLIENT FILES',
    incClients.map((client) => ({ client, secret: secretsMap[client.id] }))
  );

  buildCourtCasesSheet(workbook, 'COURT CASES FILES (CF)', clients, cases);

  return workbook;
}

export async function exportMasterExcelWorkbook(
  clients: Client[],
  cases: CaseFile[],
  secretsMap: Record<string, ClientVaultSecret>
) {
  const workbook = buildMasterExcelWorkbook(clients, cases, secretsMap);
  const dateTag = new Date().toISOString().split('T')[0];
  await triggerExcelDownload(workbook, `HISK_LEGAL_Master_4_Sheets_${dateTag}.xlsx`);
}

export async function exportIncomeTaxSheetExcel(
  clients: Client[],
  secretsMap: Record<string, ClientVaultSecret>
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HISK LEGAL Portal';
  workbook.created = new Date();
  buildIncomeTaxSheet(workbook, 'INCOME TAX CLIENTS', clients, secretsMap);
  const dateTag = new Date().toISOString().split('T')[0];
  await triggerExcelDownload(workbook, `HISK_LEGAL_Income_Tax_IT_${dateTag}.xlsx`);
}

export async function exportSalesTaxSheetExcel(
  clients: Client[],
  secretsMap: Record<string, ClientVaultSecret>
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HISK LEGAL Portal';
  workbook.created = new Date();
  buildSalesTaxSheet(workbook, 'SALES TAX CLIENTS', clients, secretsMap);
  const dateTag = new Date().toISOString().split('T')[0];
  await triggerExcelDownload(workbook, `HISK_LEGAL_Sales_Tax_ST_${dateTag}.xlsx`);
}

export async function exportIncSheetExcel(
  clients: Client[],
  secretsMap: Record<string, ClientVaultSecret>,
  filterCode: 'ALL_INC' | 'IT' | 'ST' | 'INC' = 'INC'
) {
  if (filterCode === 'IT') {
    await exportIncomeTaxSheetExcel(clients, secretsMap);
    return;
  }
  if (filterCode === 'ST') {
    await exportSalesTaxSheetExcel(clients, secretsMap);
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HISK LEGAL Portal';
  workbook.created = new Date();

  const matching = sortByFileNumber(
    clients.filter((cl) => {
      const code = inferClientFileCode(cl);
      if (filterCode === 'ALL_INC') {
        return code === 'IT' || code === 'ST' || code === 'INC';
      }
      return code === 'INC';
    })
  );

  buildIncFormatSheet(
    workbook,
    'AOP_NPO_COMPANY CLIENT FILES',
    'AOP/NPO/COMPANY CLIENT FILES',
    matching.map((client) => ({ client, secret: secretsMap[client.id] }))
  );

  const dateTag = new Date().toISOString().split('T')[0];
  await triggerExcelDownload(workbook, `HISK_LEGAL_Incorporation_INC_${dateTag}.xlsx`);
}

export async function exportCourtCasesSheetExcel(
  clients: Client[],
  cases: CaseFile[]
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HISK LEGAL Portal';
  workbook.created = new Date();

  buildCourtCasesSheet(workbook, 'COURT CASES FILES', clients, cases);

  const dateTag = new Date().toISOString().split('T')[0];
  await triggerExcelDownload(workbook, `HISK_LEGAL_Court_Cases_CF_${dateTag}.xlsx`);
}
