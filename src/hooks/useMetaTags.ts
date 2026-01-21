/**
 * Hook to dynamically update meta tags for SEO and social sharing
 *
 * Updates Open Graph, Twitter Card, and other SEO meta tags
 * based on the current page context.
 *
 * @param options - Meta tag configuration options
 *
 * @example
 * ```tsx
 * useMetaTags({
 *   title: 'Goals',
 *   description: 'Manage and track your goals',
 *   image: '/og-image.png',
 *   url: '/goals'
 * });
 * ```
 */

import { useEffect } from 'react';

import { APP_NAME } from '@/utils/constants';

interface MetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}

const DEFAULT_DESCRIPTION =
  'A comprehensive goals tracking management system built with React, TypeScript, and Ant Design';
const DEFAULT_IMAGE = '/logo.png';
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

/**
 * Update or create a meta tag
 */
const setMetaTag = (property: string, content: string, isProperty = false): void => {
  if (typeof document === 'undefined') return;

  const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
  let element = document.querySelector(selector) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    if (isProperty) {
      element.setAttribute('property', property);
    } else {
      element.setAttribute('name', property);
    }
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

/**
 * Update or create a link tag
 */
const setLinkTag = (rel: string, href: string): void => {
  if (typeof document === 'undefined') return;

  const selector = `link[rel="${rel}"]`;
  let element = document.querySelector(selector) as HTMLLinkElement;

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

/**
 * useMetaTags Hook
 */
export const useMetaTags = (options: MetaTagsOptions = {}): void => {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url = '',
    type = 'website',
    keywords = ['goals', 'tracking', 'productivity', 'goal management', 'progress tracking', 'habits', 'milestones'],
  } = options;

  useEffect(() => {
    // Build full title
    const fullTitle = title ? `${title} | ${APP_NAME}` : `${APP_NAME} - Goals Tracking Management System`;
    const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
    const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

    // Update document title
    document.title = fullTitle;

    // Basic SEO meta tags
    setMetaTag('title', fullTitle);
    setMetaTag('description', description);
    setMetaTag('keywords', keywords.join(', '));

    // Open Graph meta tags (Facebook, LinkedIn, etc.)
    setMetaTag('og:type', type, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', fullImage, true);
    setMetaTag('og:url', fullUrl, true);
    setMetaTag('og:site_name', APP_NAME, true);
    setMetaTag('og:locale', 'en_US', true);

    // Twitter Card meta tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', fullImage);

    // Additional SEO meta tags
    setMetaTag('robots', 'index, follow');
    setMetaTag('author', 'Goals Tracking Contributors');
    setMetaTag('copyright', `Copyright © ${new Date().getFullYear()} Goals Tracking Contributors`);

    // Canonical URL
    setLinkTag('canonical', fullUrl);

    // Cleanup function (optional - meta tags persist across navigation in SPAs)
    return () => {
      // Meta tags are typically not removed on navigation in SPAs
      // as they're updated rather than removed
    };
  }, [title, description, image, url, type, keywords]);
};
