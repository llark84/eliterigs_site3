/**
 * URL Redirect Mapping System
 * Handles legacy URLs and slug changes for SEO purposes
 */

export interface RedirectRule {
  from: string;
  to: string;
  type: 'permanent' | 'temporary';
  reason?: string;
}

/**
 * Redirect mapping for maintaining SEO when URLs change
 * Add new mappings here when URLs need to be changed
 */
export const REDIRECT_MAP: RedirectRule[] = [
  // Legacy singular to plural routes
  {
    from: '/preset/:id',
    to: '/presets/:id',
    type: 'permanent',
    reason: 'URL structure update to plural form',
  },
  {
    from: '/guide/:id',
    to: '/guides/:id',
    type: 'permanent',
    reason: 'URL structure update to plural form',
  },

  // Specific preset slug updates
  {
    from: '/presets/gaming-1200',
    to: '/presets/terra-4080s',
    type: 'permanent',
    reason: 'Updated preset naming convention',
  },
  {
    from: '/presets/budget-800',
    to: '/presets/starter-esports',
    type: 'permanent',
    reason: 'Updated preset naming convention',
  },

  // Guide slug updates
  {
    from: '/guides/compatibility-guide',
    to: '/guides/pc-compatibility-10-rules',
    type: 'permanent',
    reason: 'More descriptive guide URL',
  },
  {
    from: '/guides/best-gaming-build',
    to: '/guides/best-1500-build',
    type: 'permanent',
    reason: 'More specific guide title',
  },

  // Legacy query parameter formats
  {
    from: '/builder?type=gaming',
    to: '/builder?use=gaming',
    type: 'permanent',
    reason: 'Simplified query parameter naming',
  },
];

/**
 * Check if a URL should be redirected
 * @param currentPath - The current path to check
 * @returns Redirect rule if found, null otherwise
 */
export function getRedirectForPath(currentPath: string): RedirectRule | null {
  // Check exact matches first
  const exactMatch = REDIRECT_MAP.find((rule) => rule.from === currentPath);
  if (exactMatch) {
    return exactMatch;
  }

  // Check pattern matches (with :id parameters)
  for (const rule of REDIRECT_MAP) {
    if (rule.from.includes(':')) {
      const pattern = rule.from.replace(/:(\w+)/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      const match = currentPath.match(regex);

      if (match) {
        // Replace parameters in the target URL
        let targetUrl = rule.to;
        const paramNames = rule.from.match(/:(\w+)/g);

        if (paramNames) {
          paramNames.forEach((param, index) => {
            const paramName = param.substring(1); // Remove the ':'
            targetUrl = targetUrl.replace(`:${paramName}`, match[index + 1]);
          });
        }

        return {
          ...rule,
          to: targetUrl,
        };
      }
    }
  }

  return null;
}

/**
 * Generate canonical URL by removing query parameters that don't affect content
 * @param path - The path to canonicalize
 * @returns Clean canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const url = new URL(path, 'https://eliterigs.replit.app');

  // Keep only SEO-relevant query parameters
  const keepParams = ['use', 'budget', 'category'];
  const searchParams = new URLSearchParams();

  keepParams.forEach((param) => {
    const value = url.searchParams.get(param);
    if (value) {
      searchParams.set(param, value);
    }
  });

  const canonicalPath = url.pathname;
  const queryString = searchParams.toString();

  return queryString ? `${canonicalPath}?${queryString}` : canonicalPath;
}

/**
 * Validate URL slug format
 * @param slug - The slug to validate
 * @returns Whether the slug is valid
 */
export function isValidSlug(slug: string): boolean {
  // Allow letters, numbers, hyphens, and underscores
  // Must start and end with alphanumeric character
  const slugPattern = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
  return slugPattern.test(slug);
}

/**
 * Create SEO-friendly slug from title
 * @param title - The title to convert
 * @returns SEO-friendly slug
 */
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[-\s]+/g, '-') // Replace spaces and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
