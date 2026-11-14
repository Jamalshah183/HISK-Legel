import React from 'react';
import type { Metadata } from 'next';
import { getAllInsightsServer } from '@/lib/insightsServer';
import { InsightsIndexClient } from '@/components/insights/InsightsIndexClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Legal Insights & Blog | HISK LEGAL',
  description:
    'Authoritative legal analysis on FBR tax audits, High Court constitutional writs, Section 7E property tax exemptions, family law, and SECP corporate compliance in Pakistan.',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function InsightsPage() {
  const initialPosts = await getAllInsightsServer();
  return <InsightsIndexClient initialPosts={initialPosts} />;
}
