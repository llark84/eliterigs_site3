/**
 * Centralized copy and text constants for the EliteRigs application
 */

export const BRAND = {
  name: 'EliteRigs',
  title: 'EliteRigs PC Builder',
  tagline: 'Build Your Dream PC',
  domain: 'eliterigs.replit.app',
} as const;

export const PAGE_TITLES = {
  home: `${BRAND.title} | ${BRAND.tagline}`,
  builder: `PC Builder | ${BRAND.name}`,
  presets: `Gaming Presets | ${BRAND.name}`,
  guides: `PC Building Guides | ${BRAND.name}`,
  notFound: `Page Not Found (404) | ${BRAND.title}`,
  buildShare: `Build Configuration | ${BRAND.name}`,
} as const;

export const QUICK_LINKS = [
  {
    title: 'PC Builder',
    description: 'Build your custom PC with compatibility checking',
    href: '/builder',
    badge: 'Popular',
  },
  {
    title: 'PC Guides',
    description: 'Learn about PC building and compatibility',
    href: '/guides/pc-compatibility-10-rules',
    badge: 'Educational',
  },
  {
    title: 'Gaming Presets',
    description: 'Pre-configured builds for different budgets',
    href: '/presets/terra-4080s',
    badge: 'Ready to Use',
  },
] as const;

export const ASSEMBLY_STEPS = [
  {
    title: 'Install CPU',
    description: 'Place processor in motherboard socket (easiest first!)',
    time: '1 min',
  },
  {
    title: 'Add RAM',
    description: 'Snap memory modules into DIMM slots',
    time: '30 sec',
  },
  {
    title: 'Mount Motherboard',
    description: 'Secure motherboard in case with standoffs',
    time: '2 min',
  },
  {
    title: 'Install Storage',
    description: 'Connect SSD/HDD with SATA or M.2',
    time: '1 min',
  },
  {
    title: 'Add Graphics Card',
    description: 'Insert GPU into top PCIe slot',
    time: '30 sec',
  },
  {
    title: 'Connect Power',
    description: 'Plug in all power cables from PSU',
    time: '2 min',
  },
] as const;

export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  validation: 'Please fill in all required fields correctly.',
  compatibility: 'These components may not be compatible.',
} as const;

export const SUCCESS_MESSAGES = {
  buildSaved: 'Build configuration saved successfully!',
  buildShared: 'Build link copied to clipboard!',
  presetLoaded: 'Preset loaded successfully!',
} as const;
