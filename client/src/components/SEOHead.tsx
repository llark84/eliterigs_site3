import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  pageType?: 'home' | 'builder' | 'preset' | 'guide' | 'build-share';
  jsonLd?: any; // JSON-LD structured data
}

// Helper function to ensure description is within SEO limits (155 chars)
const truncateDescription = (desc: string, maxLength = 155): string => {
  if (desc.length <= maxLength) return desc;
  return desc.substring(0, maxLength - 3).trim() + '...';
};

// Helper function to generate clean canonical URL (no query params)
const getCleanCanonicalUrl = (): string => {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}`;
};

// Page-specific SEO defaults
const getPageDefaults = (pageType?: string) => {
  switch (pageType) {
    case 'home':
      return {
        title: 'EliteRigs — PC Compatibility Checker & Guided Builder',
        description:
          'Build smarter PCs with compatibility checks, real-time pricing from multiple vendors, and smart accessory recommendations. No guesswork.',
      };
    case 'builder':
      return {
        title: 'PC Builder — EliteRigs Compatibility Checker',
        description:
          'Build your perfect PC with real-time compatibility checking, vendor price comparison, and component recommendations.',
      };
    case 'preset':
      return {
        title: 'PC Build Presets — EliteRigs',
        description:
          'Curated PC build presets for gaming, streaming, workstations, and budget builds. Tested configurations that just work.',
      };
    case 'guide':
      return {
        title: 'PC Building Guides — EliteRigs',
        description:
          'Expert PC building guides covering compatibility rules, component selection, and build optimization tips from EliteRigs.',
      };
    case 'build-share':
      return {
        title: 'Shared PC Build — EliteRigs',
        description:
          'View this custom PC build configuration with detailed component list, pricing, and compatibility analysis.',
      };
    default:
      return {
        title: 'EliteRigs — PC Compatibility Checker & Guided Builder',
        description:
          'Build smarter PCs with compatibility checks, real-time pricing from multiple vendors, and smart accessory recommendations. No guesswork.',
      };
  }
};

export function SEOHead({
  title,
  description,
  canonical,
  ogImage = '/og-default.svg',
  ogType = 'website',
  noindex = false,
  pageType,
  jsonLd,
}: SEOHeadProps) {
  // Get defaults based on page type
  const defaults = getPageDefaults(pageType);
  const finalTitle = title || defaults.title;
  const finalDescription = truncateDescription(description || defaults.description);
  const finalCanonical = canonical || getCleanCanonicalUrl();
  useEffect(() => {
    // Set document title
    document.title = finalTitle;

    // Helper function to set or update meta tags
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper function to set or update link tags
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Basic meta tags
    setMetaTag('description', finalDescription);
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Canonical URL (always set to clean URL without query params)
    setLinkTag('canonical', finalCanonical);

    // Open Graph tags
    setMetaTag('og:title', finalTitle, true);
    setMetaTag('og:description', finalDescription, true);
    setMetaTag('og:url', finalCanonical, true);
    setMetaTag(
      'og:image',
      ogImage.startsWith('http') ? ogImage : window.location.origin + ogImage,
      true
    );
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:site_name', 'EliteRigs', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalTitle);
    setMetaTag('twitter:description', finalDescription);
    setMetaTag(
      'twitter:image',
      ogImage.startsWith('http') ? ogImage : window.location.origin + ogImage
    );

    // Additional meta tags
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    setMetaTag('theme-color', '#3b82f6');

    // CDN preconnect links for performance
    const preconnectLinks = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    ];

    // Remove existing preconnect links
    const existingPreconnects = document.querySelectorAll('link[rel="preconnect"]');
    existingPreconnects.forEach((link) => link.remove());

    // Add preconnect links
    preconnectLinks.forEach((linkInfo) => {
      const link = document.createElement('link');
      Object.entries(linkInfo).forEach(([key, value]) => {
        if (key === 'crossorigin') {
          link.setAttribute('crossorigin', '');
        } else {
          link.setAttribute(key, value);
        }
      });
      document.head.appendChild(link);
    });

    // Favicon and PWA links
    const faviconLinks = [
      { rel: 'icon', type: 'image/svg+xml', sizes: '16x16', href: '/favicon-16x16.svg' },
      { rel: 'icon', type: 'image/svg+xml', sizes: '32x32', href: '/favicon-32x32.svg' },
      { rel: 'icon', type: 'image/svg+xml', sizes: '96x96', href: '/favicon-96x96.svg' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.svg' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ];

    // Remove existing favicon/manifest links
    const existingLinks = document.querySelectorAll(
      'link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]'
    );
    existingLinks.forEach((link) => link.remove());

    // Add new favicon and manifest links
    faviconLinks.forEach((linkInfo) => {
      const link = document.createElement('link');
      Object.entries(linkInfo).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      document.head.appendChild(link);
    });

    // JSON-LD structured data
    const existingJsonLd = document.querySelector('script[type="application/ld+json"]#seo-jsonld');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'seo-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [finalTitle, finalDescription, finalCanonical, ogImage, ogType, noindex, jsonLd]);

  return null; // This component doesn't render anything
}

export default SEOHead;
