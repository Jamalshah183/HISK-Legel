import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/insights', '/insights/'],
        disallow: ['/admin', '/client'],
      },
    ],
  };
}
