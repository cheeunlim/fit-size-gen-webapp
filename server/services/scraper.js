import puppeteer from 'puppeteer';

export const scrapeProductImages = async (url) => {
    console.log(`[Scraper] Starting scrape for ${url}`);
    
    // Launch headless browser
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        // Block heavy resources to speed up
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const types = ['stylesheet', 'font', 'media'];
            if (types.includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(url, { waitUntil: 'load', timeout: 30000 });

        // Wait a bit for JS to render images
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract image URLs
        const images = await page.evaluate(() => {
            const imgElements = Array.from(document.querySelectorAll('img'));
            return imgElements
                .map(img => ({
                    src: img.src,
                    width: img.naturalWidth || img.width,
                    height: img.naturalHeight || img.height,
                    alt: img.alt || ''
                }))
                .filter(img => img.src && img.src.startsWith('http') && (img.width > 200 || img.height > 200))
                .map(img => img.src);
        });

        console.log(`[Scraper] Extracted ${images.length} candidate images.`);
        return images;

    } catch (error) {
        console.error("[Scraper] Error during scraping:", error);
        throw error;
    } finally {
        await browser.close();
    }
};
