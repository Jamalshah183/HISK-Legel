import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HISK LEGAL | High Court Tax Advocates & Legal Counsel Islamabad',
  description: 'HISK LEGAL - High Court Tax Advocates & Legal Counsel in Islamabad, Pakistan. FBR Audit Defense, Tax Return Filing, Section 7E Exemption, Corporate SECP Compliance, and direct WhatsApp consultations.',
  keywords: ['HISK LEGAL', 'Tax Law Firm Islamabad', 'FBR Audit Defense', 'High Court Advocate', 'Pakistani Tax Calculator', 'Corporate Tax Law', 'G-8 Markaz Islamabad'],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#FAFAF7] text-[#1A1A1A] antialiased selection:bg-[#F5A623] selection:text-[#1A1A1A]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
