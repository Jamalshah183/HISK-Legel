import React from 'react';
import type { Metadata } from 'next';
import { getInsightBySlugServer } from '@/lib/insightsServer';
import { InsightArticleClient } from '@/components/insights/InsightArticleClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getInsightBySlugServer(slug);

  if (!post) {
    return {
      title: 'Legal Briefing Not Found | HISK LEGAL',
      description: 'Explore authoritative legal briefings and tax insights from HISK LEGAL.',
    };
  }

  const authorName =
    typeof post.author === 'object' && post.author !== null
      ? post.author.name
      : String(post.author || 'HISK LEGAL');

  return {
    title: `${post.title} | HISK LEGAL`,
    description: post.excerpt || post.content[0]?.slice(0, 160) || post.title,
    authors: [{ name: authorName }],
    keywords: [
      post.category,
      'HISK LEGAL',
      'Pakistan Law',
      'High Court Advocate',
      'Legal Insights',
    ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || post.content[0]?.slice(0, 160) || post.title,
      publishedTime: post.createdAt || post.date,
      authors: [authorName],
      section: post.category,
      siteName: 'HISK LEGAL',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content[0]?.slice(0, 160) || post.title,
    },
  };
}

export default async function SingleBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { post, allPosts } = await getInsightBySlugServer(slug);

  const authorName =
    post && typeof post.author === 'object' && post.author !== null
      ? post.author.name
      : post
        ? String(post.author || 'HISK LEGAL Counsel')
        : 'HISK LEGAL Counsel';

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        articleSection: post.category,
        datePublished: post.createdAt || post.date,
        dateModified: post.updatedAt || post.createdAt || post.date,
        author: {
          '@type': 'Person',
          name: authorName,
        },
        publisher: {
          '@type': 'Organization',
          name: 'HISK LEGAL',
        },
        articleBody: [
          ...(post.keyTakeaways || []),
          ...(post.content || []),
        ].join('\n\n'),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <InsightArticleClient
        slug={slug}
        initialPost={post}
        initialAllPosts={allPosts}
      />
    </>
  );
}
