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
    videoUrl: '',
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
    videoUrl: '',
    posterUrl: 'https://images.pexels.com/photos/15438992/pexels-photo-15438992.jpeg',
    description: 'Financial Capital, Port City, Sindh High Court & Corporate Tax Litigation Desk'
  },
  {
    id: 'lahore',
    cityName: 'Lahore',
    country: 'Pakistan',
    regionTag: 'Cultural Capital & Lahore High Court',
    landmark: 'Badshahi Mosque & Mall Road',
    flagEmoji: '🇵🇰',
    videoUrl: '',
    posterUrl: 'https://images.pexels.com/photos/15714421/pexels-photo-15714421.jpeg',
    description: 'Cultural & Commercial Capital, Lahore High Court Principal Seat & FBR Revenue Practice'
  },
  {
    id: 'rawalpindi',
    cityName: 'Rawalpindi',
    country: 'Pakistan',
    regionTag: 'Twin City Commerce & Defence Hub',
    landmark: 'Rawal Lake & Potohar Gateway',
    flagEmoji: '🇵🇰',
    videoUrl: '',
    posterUrl: 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg',
    description: 'Twin City Hub, Corporate Taxation, Customs & Revenue Appellate Practice'
  },
  {
    id: 'peshawar',
    cityName: 'Peshawar',
    country: 'Pakistan',
    regionTag: 'KPK Gateway & High Court',
    landmark: 'Islamia College & Bab-e-Khyber',
    flagEmoji: '🇵🇰',
    videoUrl: '',
    posterUrl: 'https://images.pexels.com/photos/11545107/pexels-photo-11545107.jpeg',
    description: 'KPK Commercial Hub, Peshawar High Court & Regional Cross-Border Customs Practice'
  },
  {
    id: 'faisalabad',
    cityName: 'Faisalabad',
    country: 'Pakistan',
    regionTag: 'Industrial & Textile Tax Hub',
    landmark: 'Historic Clock Tower (Ghanta Ghar)',
    flagEmoji: '🇵🇰',
    videoUrl: '',
    posterUrl: 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg',
    description: 'Industrial Powerhouse, Sales Tax, Excise, Customs & Corporate Dispute Resolution'
  },
  {
    id: 'multan',
    cityName: 'Multan',
    country: 'Pakistan',
    regionTag: 'South Punjab Commercial & Tax Hub',
    landmark: 'Tomb of Shah Rukn-e-Alam',
    flagEmoji: '🇵🇰',
    videoUrl: '',
    posterUrl: 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg',
    description: 'Southern Punjab Regional Legal Desk, High Court Bench & Commercial Advisory'
  },
  {
    id: 'quetta',
    cityName: 'Quetta',
    country: 'Pakistan',
    regionTag: 'Balochistan & Trade Gateway',
    landmark: 'Hanna Lake & Rugged Mountain Pass',
    flagEmoji: '🇵🇰',
    videoUrl: '',
    posterUrl: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg',
    description: 'Balochistan High Court Seat, Transit Trade, Energy Sector & Corporate Litigation'
  }
];
