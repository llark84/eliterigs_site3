/**
 * Centralized configuration constants for the EliteRigs application
 */

export const API_ENDPOINTS = {
  compatibility: '/api/compatibility',
  prices: '/api/prices',
  builds: '/api/builds',
  accessories: '/api/accessories',
  verify: (partId: string) => `/api/verify/${partId}`,
  status: '/status',
} as const;

export const VENDOR_ENDPOINTS = {
  amazon: {
    search: '/s?k=',
    product: '/dp/',
  },
  newegg: {
    search: '/p/pl?d=',
    product: '/p/',
  },
  bestbuy: {
    search: '/site/searchpage.jsp?st=',
    product: '/site/',
  },
} as const;

export const UI_CONFIG = {
  mobileBreakpoint: 768,
  sidebarCookieName: 'sidebar:state',
  sidebarCookieMaxAge: 60 * 60 * 24 * 7, // 7 days
  defaultSidebarWidth: '16rem',
  iconSidebarWidth: '3rem',
} as const;

export const SEO_CONFIG = {
  keepParams: ['use', 'budget', 'category'],
  defaultDescription:
    'Build your custom PC with compatibility checking and beginner-friendly guidance.',
  defaultImage: '/og-image.png',
} as const;

export const USE_CASE_PRIORITIES = {
  gaming: {
    primaryCategories: ['GPU', 'CPU', 'RAM'] as const,
    sortBy: 'performance' as const,
    budgetWeights: {
      GPU: 0.4,
      CPU: 0.25,
      RAM: 0.15,
      Motherboard: 0.08,
      SSD: 0.07,
      PSU: 0.03,
      Case: 0.02,
    },
  },
  streaming: {
    primaryCategories: ['CPU', 'RAM', 'GPU'] as const,
    sortBy: 'performance' as const,
    budgetWeights: {
      CPU: 0.35,
      RAM: 0.2,
      GPU: 0.25,
      SSD: 0.1,
      Motherboard: 0.05,
      PSU: 0.03,
      Case: 0.02,
    },
  },
  'ai-ml': {
    primaryCategories: ['GPU', 'RAM', 'CPU'] as const,
    sortBy: 'performance' as const,
    budgetWeights: {
      GPU: 0.5,
      RAM: 0.25,
      CPU: 0.15,
      SSD: 0.05,
      Motherboard: 0.03,
      PSU: 0.015,
      Case: 0.005,
    },
  },
  'quiet-sff': {
    primaryCategories: ['Case', 'Cooling', 'PSU'] as const,
    sortBy: 'efficiency' as const,
    budgetWeights: {
      CPU: 0.2,
      GPU: 0.25,
      RAM: 0.15,
      Case: 0.15,
      Cooling: 0.1,
      PSU: 0.1,
      Motherboard: 0.03,
      SSD: 0.02,
    },
  },
  budget: {
    primaryCategories: ['CPU', 'GPU', 'RAM'] as const,
    sortBy: 'value' as const,
    budgetWeights: {
      CPU: 0.25,
      GPU: 0.3,
      RAM: 0.15,
      Motherboard: 0.1,
      SSD: 0.1,
      PSU: 0.06,
      Case: 0.04,
    },
  },
  workstation: {
    primaryCategories: ['CPU', 'RAM', 'Storage'] as const,
    sortBy: 'reliability' as const,
    budgetWeights: {
      CPU: 0.35,
      RAM: 0.25,
      SSD: 0.15,
      GPU: 0.1,
      Motherboard: 0.08,
      PSU: 0.05,
      Case: 0.02,
    },
  },
} as const;

export const ANIMATION_CONFIG = {
  defaultDuration: 200,
  fastDuration: 100,
  slowDuration: 300,
  staggerDelay: 50,
} as const;

export const COMPATIBILITY_THRESHOLDS = {
  powerMargin: 0.2, // 20% PSU headroom
  gpuClearanceBuffer: 10, // 10mm GPU clearance buffer
  coolerHeightBuffer: 5, // 5mm cooler height buffer
} as const;
