const fs = require('fs');
const path = require('path');
const SitemapGenerator = require('sitemap-generator');

/**
 * Generate a sitemap for the provided base URL and save it to
 * public/sitemaps/<hostname-without-tld>/sitemap.xml
 *
 * - Creates the `public/sitemaps` and host folder if missing
 * - Overwrites any existing sitemap.xml for that host
 *
 * @param {string} baseUrl - The base URL to crawl, e.g. "https://example.com"
 * @returns {Promise<string>} - Resolves with the absolute path to the written sitemap
 */
const GenerateSitemap = async (baseUrl) => {
    if (!baseUrl || typeof baseUrl !== 'string') {
        throw new Error('GenerateSitemap: baseUrl must be a non-empty string');
    }

    let urlObj;
    try {
        urlObj = new URL(baseUrl);
    } catch (err) {
        throw new Error(`GenerateSitemap: Invalid baseUrl: ${baseUrl}`);
    }

    const hostname = urlObj.hostname; // e.g. "www.example.com"
    const parts = hostname.split('.');
    const hostWithoutTld = parts.length > 1 ? parts.slice(0, -1).join('.') : hostname; // e.g. "www.example"

    const outputDir = path.join('public', 'sitemaps', hostWithoutTld);
    const outputFile = path.join(outputDir, 'sitemap.xml');

    await fs.promises.mkdir(outputDir, { recursive: true });

    // If a previous sitemap exists, remove it to guarantee a clean write
    try {
        await fs.promises.unlink(outputFile);
    } catch (_) {
        // ignore if not exists
    }

    // Initialize and run the generator
    const generator = SitemapGenerator(urlObj.origin, {
        stripQuerystring: false,
        filepath: outputFile,
    });

    return new Promise((resolve, reject) => {
        generator.on('done', () => resolve(path.resolve(outputFile)));

        // Log individual URL errors and continue crawling
        generator.on('error', (error) => {
            try {
                const code = error?.status || error?.code || 'ERR';
                const url = error?.url || '';
                const message = error?.message || String(error);
                // eslint-disable-next-line no-console
                console.warn(`[sitemap] Skipped URL (${code}) ${url} - ${message}`);
            } catch (_) {
                // eslint-disable-next-line no-console
                console.warn('[sitemap] Skipped URL due to an error.');
            }
        });

        try {
            generator.start();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = GenerateSitemap;
