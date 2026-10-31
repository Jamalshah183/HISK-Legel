export interface CityVideo {
  id: string;
  cityName: string;
  country: string;
  regionTag: string;
  flagEmoji: string;
  videoUrl: string;
  fallbackUrl?: string;
  description: string;
}

export const HERO_CITY_VIDEOS: CityVideo[] = [
  {
    id: 'islamabad',
    cityName: 'Islamabad',
    country: 'Pakistan',
    regionTag: 'Capital & Supreme Court Hub',
    flagEmoji: '🇵🇰',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-city-at-sunset-41584-large.mp4',
    fallbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-buildings-and-streets-41585-large.mp4',
    description: 'Federal Capital, Supreme Court of Pakistan & Islamabad High Court Legal Practice Hub'
  },
  {
    id: 'karachi',
    cityName: 'Karachi',
    country: 'Pakistan',
    regionTag: 'Financial Capital & Sindh High Court',
    flagEmoji: '🇵🇰',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-drone-shot-of-a-city-by-the-water-41586-large.mp4',
    fallbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-shot-of-a-city-with-skyscrapers-41587-large.mp4',
    description: 'Financial Capital, Port City, Sindh High Court & Corporate Tax Litigation Desk'
  },
  {
    id: 'lahore',
    cityName: 'Lahore',
    country: 'Pakistan',
    regionTag: 'Cultural Capital & Lahore High Court',
    flagEmoji: '🇵🇰',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-shot-of-a-city-with-skyscrapers-41587-large.mp4',
    fallbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-busy-city-intersection-41589-large.mp4',
    description: 'Cultural & Commercial Capital, Lahore High Court Principal Seat & FBR Revenue Practice'
  },
  {
    id: 'rawalpindi',
    cityName: 'Rawalpindi',
    country: 'Pakistan',
    regionTag: 'Twin City Commerce & Defence Hub',
    flagEmoji: '🇵🇰',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-in-a-city-at-sunset-41591-large.mp4',
    fallbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-city-at-sunset-41584-large.mp4',
    description: 'Twin City Hub, Corporate Taxation, Customs & Revenue Appellate Practice'
  },
  {
    id: 'peshawar',
    cityName: 'Peshawar',
    country: 'Pakistan',
    regionTag: 'KPK Gateway & High Court',
    flagEmoji: '🇵🇰',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-buildings-and-streets-41585-large.mp4',
    fallbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-busy-city-intersection-41589-large.mp4',
    description: 'KPK Commercial Hub, Peshawar High Court & Regional Cross-Border Customs Practice'
  },
  {
    id: 'faisalabad',
    cityName: 'Faisalabad',
    country: 'Pakistan',
    regionTag: 'Industrial & Textile Tax Hub',
    flagEmoji: '🇵🇰',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-busy-city-intersection-41589-large.mp4',
    fallbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-in-a-city-at-sunset-41591-large.mp4',
    description: 'Industrial Powerhouse, Sales Tax, Excise, Customs & Corporate Dispute Resolution'
  },
  {
    id: 'multan',
    cityName: 'Multan',
    country: 'Pakistan',
    regionTag: 'South Punjab Commercial & Tax Hub',
    flagEmoji: '🇵🇰',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-panoramic-view-of-a-modern-city-at-night-41590-large.mp4',
    fallbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-skyscrapers-at-sunset-41588-large.mp4',
    description: 'Southern Punjab Regional Legal Desk, High Court Bench & Commercial Advisory'
  },
  {
    id: 'quetta',
    cityName: 'Quetta',
    country: 'Pakistan',
    regionTag: 'Balochistan & Trade Gateway',
    flagEmoji: '🇵🇰',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-skyscrapers-at-sunset-41588-large.mp4',
    fallbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-drone-shot-of-a-city-by-the-water-41586-large.mp4',
    description: 'Balochistan High Court Seat, Transit Trade, Energy Sector & Commercial Litigation'
  }
];

