export interface CityVideo {
  id: string;
  cityName: string;
  country: string;
  regionTag: string;
  flagEmoji: string;
  landmark: string;
  videoUrl: string;
  posterUrl: string;
  description: string;
}

export const HERO_CITY_VIDEOS: CityVideo[] = [
  {
    id: 'islamabad',
    cityName: 'Islamabad',
    country: 'Pakistan',
    regionTag: 'Capital & Supreme Court Hub',
    landmark: 'Faisal Mosque & Margalla Hills',
    flagEmoji: '🇵🇰',
    videoUrl: '/videos/islamabad.mp4',
    posterUrl: 'https://images.pexels.com/photos/5258953/pexels-photo-5258953.jpeg',
    description: 'Federal Capital, Supreme Court of Pakistan & Islamabad High Court Legal Practice Hub'
  },
  {
    id: 'karachi',
    cityName: 'Karachi',
    country: 'Pakistan',
    regionTag: 'Financial Capital & Sindh High Court',
    landmark: 'Karachi Port & Marine Skyline',
    flagEmoji: '🇵🇰',
    videoUrl: '/videos/karachi.mp4',
    posterUrl: '/images/cities/karachi.jpg',
    description: 'Financial Capital, Port City, Sindh High Court & Corporate Tax Litigation Desk'
  },
  {
    id: 'lahore',
    cityName: 'Lahore',
    country: 'Pakistan',
    regionTag: 'Cultural Capital & Lahore High Court',
    landmark: 'Badshahi Mosque & Mall Road',
    flagEmoji: '🇵🇰',
    videoUrl: '/videos/lahore.mp4',
    posterUrl: '/images/cities/lahore.jpg',
    description: 'Cultural & Commercial Capital, Lahore High Court Principal Seat & FBR Revenue Practice'
  },
  {
    id: 'rawalpindi',
    cityName: 'Rawalpindi',
    country: 'Pakistan',
    regionTag: 'Twin City Commerce & Defence Hub',
    landmark: 'Rawal Lake & Potohar Gateway',
    flagEmoji: '🇵🇰',
    videoUrl: '/videos/rawalpindi.mp4',
    posterUrl: '/images/cities/rawalpindi.jpg',
    description: 'Twin City Hub, Corporate Taxation, Customs & Revenue Appellate Practice'
  },
  {
    id: 'peshawar',
    cityName: 'Peshawar',
    country: 'Pakistan',
    regionTag: 'KPK Gateway & High Court',
    landmark: 'Islamia College & Bab-e-Khyber',
    flagEmoji: '🇵🇰',
    videoUrl: '/videos/peshawar.mp4',
    posterUrl: '/images/cities/peshawar.jpg',
    description: 'KPK Commercial Hub, Peshawar High Court & Regional Cross-Border Customs Practice'
  },
  {
    id: 'faisalabad',
    cityName: 'Faisalabad',
    country: 'Pakistan',
    regionTag: 'Industrial & Textile Tax Hub',
    landmark: 'Historic Clock Tower (Ghanta Ghar)',
    flagEmoji: '🇵🇰',
    videoUrl: '/videos/faisalabad.mp4',
    posterUrl: '/images/cities/faisalabad.jpg',
    description: 'Industrial Powerhouse, Sales Tax, Excise, Customs & Corporate Dispute Resolution'
  },
  {
    id: 'multan',
    cityName: 'Multan',
    country: 'Pakistan',
    regionTag: 'South Punjab Commercial & Tax Hub',
    landmark: 'Tomb of Shah Rukn-e-Alam',
    flagEmoji: '🇵🇰',
    videoUrl: '/videos/multan.mp4',
    posterUrl: '/images/cities/multan.jpg',
    description: 'Southern Punjab Regional Legal Desk, High Court Bench & Commercial Advisory'
  },
  {
    id: 'quetta',
    cityName: 'Quetta',
    country: 'Pakistan',
    regionTag: 'Balochistan & Trade Gateway',
    landmark: 'Hanna Lake & Rugged Mountain Pass',
    flagEmoji: '🇵🇰',
    videoUrl: '/videos/quetta.mp4',
    posterUrl: '/images/cities/quetta.jpg',
    description: 'Balochistan High Court Seat, Transit Trade, Energy Sector & Commercial Litigation'
  }
];
