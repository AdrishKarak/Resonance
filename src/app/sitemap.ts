/**
 * -----------------------------------------------------------------------------
 * Sitemap Generator
 * -----------------------------------------------------------------------------
 * Serves `/sitemap.xml` for search engine crawlers. It exists to tell crawlers
 * which pages are indexable and how often they change. Only public, marketing
 * surfaces are listed (landing page plus auth entry points); the dashboard,
 * API routes, and app pages are intentionally excluded since they require
 * authentication. The base URL comes from the APP_URL environment variable so
 * the same build works across environments.
 */
import { MetadataRoute } from 'next';

/**
 * Builds the sitemap entries for all publicly indexable routes.
 *
 * @returns A Next.js metadata sitemap listing the landing and auth pages with
 *   their change frequency and crawl priority.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // APP_URL keeps absolute URLs correct per deployment; fall back to localhost
  // so local dev and builds without the env var still produce a valid sitemap.
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';

  return [
    {
      url: `${baseUrl}/landing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
