import type { MetadataRoute } from 'next';
import { getAllInsightsServer } from '@/lib/insightsServer';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://ais-pre-ehq34cwzonfpim37wbmblr-597871829746.asia-southeast1.run.app';

  const posts = await getAllInsightsServer();
  const publishedPosts = posts.filter(
    (p) => p.status !== 'draft' && p.status !== 'archived'
  );

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...publishedPosts.map((post) => ({
      url: `${baseUrl}/insights/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
