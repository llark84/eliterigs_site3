import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import cron from "node-cron";
import { reverifyAll, setLastProvenanceRunAt } from "./provenance";

const app = express();

// Enable compression (gzip/brotli) for all responses
app.use(compression({
  // Compress all responses
  threshold: 0,
  // Use brotli when available, fallback to gzip
  level: 6
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Serve robots.txt and humans.txt from client/public with cache headers
app.get('/robots.txt', (req, res) => {
  const robotsPath = path.resolve(import.meta.dirname, '..', 'client', 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.type('text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.sendFile(robotsPath);
  } else {
    res.status(404).send('robots.txt not found');
  }
});

app.get('/humans.txt', (req, res) => {
  const humansPath = path.resolve(import.meta.dirname, '..', 'client', 'public', 'humans.txt');
  if (fs.existsSync(humansPath)) {
    res.type('text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.sendFile(humansPath);
  } else {
    res.status(404).send('humans.txt not found');
  }
});

// Server-side URL redirects for SEO and clean URLs
const SERVER_REDIRECTS = [
  // Legacy singular to plural routes (permanent redirects)
  { from: /^\/preset\/([^\/]+)$/, to: '/presets/$1', permanent: true },
  { from: /^\/guide\/([^\/]+)$/, to: '/guides/$1', permanent: true },
  
  // Specific slug updates
  { from: '/presets/gaming-1200', to: '/presets/terra-4080s', permanent: true },
  { from: '/presets/budget-800', to: '/presets/starter-esports', permanent: true },
  { from: '/guides/compatibility-guide', to: '/guides/pc-compatibility-10-rules', permanent: true },
  { from: '/guides/best-gaming-build', to: '/guides/best-1500-build', permanent: true },
];

// Apply server-side redirects including query parameters
app.use((req, res, next) => {
  const path = req.path;
  const fullUrl = req.originalUrl;
  
  // Handle query parameter redirects
  if (fullUrl.includes('?type=gaming')) {
    const newUrl = fullUrl.replace('?type=gaming', '?use=gaming');
    return res.redirect(301, newUrl);
  }
  
  for (const redirect of SERVER_REDIRECTS) {
    if (redirect.from instanceof RegExp) {
      const match = path.match(redirect.from);
      if (match) {
        const newPath = redirect.to.replace(/\$(\d+)/g, (_, n) => match[parseInt(n)]);
        const statusCode = redirect.permanent ? 301 : 302;
        return res.redirect(statusCode, newPath);
      }
    } else if (redirect.from === path) {
      const statusCode = redirect.permanent ? 301 : 302;
      return res.redirect(statusCode, redirect.to);
    }
  }
  
  next();
});

// Serve favicon and manifest files with proper cache headers
app.get('/favicon*.svg', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
  next();
});

app.get('/apple-touch-icon.svg', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
  next();
});

app.get('/icon-*.svg', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days  
  next();
});

app.get('/manifest.webmanifest', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
  res.setHeader('Content-Type', 'application/manifest+json');
  next();
});

// Sitemap endpoint with 24h caching
let sitemapCache: { content: string; timestamp: number } | null = null;
const SITEMAP_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

app.get('/sitemap.xml', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if cache is valid (less than 24 hours old)
    if (sitemapCache && (now - sitemapCache.timestamp) < SITEMAP_CACHE_DURATION) {
      res.type('application/xml');
      return res.send(sitemapCache.content);
    }

    // Generate new sitemap
    const baseUrl = 'https://eliterigs.replit.app';
    const currentDate = new Date().toISOString();

    // Start XML sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Homepage
    sitemap += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Builder page
    sitemap += `  <url>\n    <loc>${baseUrl}/builder</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // Presets - using clean URLs with descriptive slugs
    const presetSlugs = ['terra-4080s', 'balanced-1440p', 'starter-esports'];
    presetSlugs.forEach(slug => {
      sitemap += `  <url>\n    <loc>${baseUrl}/presets/${slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Best-build guides with SEO-friendly slugs
    const guideSlugs = [
      'best-1200-gaming-pc-september-2025',
      'pc-compatibility-10-rules',
      'sff-build-fractal-terra',
      'best-1500-build', // Legacy redirect
      'budget-gaming-build-800',
      'ai-workstation-setup-2025'
    ];

    guideSlugs.forEach(slug => {
      sitemap += `  <url>\n    <loc>${baseUrl}/guides/${slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Build viewer routes - only for stable, non-private builds
    // For now, using example stable build IDs (in real app, would query database for public builds)
    const publicBuildIds = [
      'build-gaming-rtx4080-setup',
      'build-budget-esports-machine', 
      'build-creator-workstation'
    ];
    
    publicBuildIds.forEach(id => {
      sitemap += `  <url>\n    <loc>${baseUrl}/build/${id}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    // Close sitemap
    sitemap += '</urlset>';

    // Cache the generated sitemap
    sitemapCache = {
      content: sitemap,
      timestamp: now
    };

    res.type('application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// Function to invalidate sitemap cache (call when new presets/guides are added)
const invalidateSitemapCache = () => {
  sitemapCache = null;
  console.log('Sitemap cache invalidated');
};

(async () => {
  const server = await registerRoutes(app);

  // Set up nightly provenance verification cron job (04:00 UTC)
  cron.schedule('0 4 * * *', async () => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    log(`[Provenance Cron] Starting nightly verification at ${timestamp}`);
    
    try {
      const stats = await reverifyAll();
      const duration = Date.now() - startTime;
      
      log(`[Provenance Cron] Completed in ${duration}ms - Total: ${stats.total}, Fresh: ${stats.fresh}, Changed: ${stats.changed}, Stale: ${stats.stale}, Unknown: ${stats.unknown}, Errors: ${stats.errors}`);
      
      setLastProvenanceRunAt(timestamp);
      
    } catch (error) {
      log(`[Provenance Cron] Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('[Provenance Cron] Nightly verification failed:', error);
    }
  }, {
    timezone: 'UTC'
  });

  log(`[Provenance Cron] Scheduled nightly verification at 04:00 UTC`);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
