/**
 * HISK LEGAL Pakistan - Direct WhatsApp Link Helper
 * Official Law Firm WhatsApp Line
 */

export const LAWFIRM_WHATSAPP_NUMBER = "923145113670"; // Country code 92 for Pakistan
export const DISPLAY_PHONE = "+92 314 5113670";
export const LAWFIRM_EMAIL = "hisklegal@gmail.com";
export const LAWFIRM_ADDRESS = "Office No.10, Second Floor, Awan Plaza, G-8 Markaz, Islamabad";
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/HISKLegal/",
  linkedin: "https://www.linkedin.com/in/hisklegal",
};

export type WhatsAppTopic =
  | 'general'
  | 'fbr_audit'
  | 'tax_calculator'
  | 'practice_area'
  | 'blog_inquiry'
  | 'urgent_notice'
  | 'business_tax';

interface BuildWhatsAppUrlOptions {
  topic?: WhatsAppTopic;
  customMessage?: string;
  practiceArea?: string;
  articleTitle?: string;
  calcDetails?: {
    income?: string;
    filingStatus?: string;
    estimatedTax?: string;
    estimatedSavings?: string;
    calcType?: string;
  };
}

export function buildWhatsAppUrl(options: BuildWhatsAppUrlOptions = {}): string {
  const { topic = 'general', customMessage, practiceArea, articleTitle, calcDetails } = options;

  let text = '';

  if (customMessage) {
    text = customMessage;
  } else {
    switch (topic) {
      case 'fbr_audit':
        text = `Assalamu Alaikum HISK LEGAL, I received an FBR Audit Notice / Show-Cause under Income Tax Ordinance and need urgent legal advocate guidance.`;
        break;
      case 'urgent_notice':
        text = `URGENT: FBR issued a notice for bank account attachment / recovery notice and I require emergency High Court tax advocate intervention.`;
        break;
      case 'tax_calculator':
        if (calcDetails) {
          text = `Assalamu Alaikum HISK LEGAL, I used your FBR Pakistan Tax Calculator:\n• Category: ${calcDetails.filingStatus || 'Not specified'}\n• Annual Income: ${calcDetails.income || 'Rs. 0'}\n• Estimated FBR Tax: ${calcDetails.estimatedTax || 'Rs. 0'}\n• Potential Legal Tax Savings: ${calcDetails.estimatedSavings || 'Rs. 0'}\n\nI would like an advocate to review my tax optimization strategy.`;
        } else {
          text = `Assalamu Alaikum HISK LEGAL, I used your tax estimation tool and would like to consult an advocate for tax optimization in Pakistan.`;
        }
        break;
      case 'practice_area':
        text = `Assalamu Alaikum HISK LEGAL, I am interested in legal assistance regarding "${practiceArea || 'Pakistani Tax Law'}". Please connect me with a High Court Tax Advocate.`;
        break;
      case 'blog_inquiry':
        text = `Assalamu Alaikum HISK LEGAL, I was reading your tax insight "${articleTitle || 'Tax Insight'}" and have a specific legal question regarding my FBR tax situation.`;
        break;
      case 'business_tax':
        text = `Assalamu Alaikum HISK LEGAL, I need legal guidance regarding SECP Private Limited incorporation, corporate tax filing, or provincial sales tax (PRA/SRB).`;
        break;
      case 'general':
      default:
        text = `Assalamu Alaikum HISK LEGAL, I would like to consult directly with a High Court Tax Advocate regarding my tax situation in Pakistan.`;
        break;
    }
  }

  const encoded = encodeURIComponent(text);
  return `https://wa.me/${LAWFIRM_WHATSAPP_NUMBER}?text=${encoded}`;
}
