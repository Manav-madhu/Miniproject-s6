import * as cheerio from 'cheerio';
import { marketplaceCatalog } from '../data/mockMarketplace.js';

function deriveSampleFromUrl(parsedUrl) {
  const pathname = decodeURIComponent(parsedUrl.pathname).toLowerCase();
  return (
    marketplaceCatalog.find((item) => item.keywords.some((keyword) => pathname.includes(keyword))) || marketplaceCatalog[0]
  );
}

function detectMarketplace(hostname) {
  if (hostname.includes('amazon')) return 'Amazon';
  if (hostname.includes('flipkart')) return 'Flipkart';
  if (hostname.includes('ebay')) return 'eBay';
  if (hostname.includes('walmart')) return 'Walmart';
  if (hostname.includes('etsy')) return 'Etsy';
  if (hostname.includes('bestbuy')) return 'Best Buy';
  return 'Marketplace';
}

function extractNumber(value, fallback) {
  if (!value) return fallback;
  const match = String(value).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : fallback;
}

export async function scrapeProductData(parsedUrl) {
  const sample = deriveSampleFromUrl(parsedUrl);
  const marketplace = detectMarketplace(parsedUrl.hostname);

  try {
    const response = await fetch(parsedUrl.href, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch listing (${response.status})`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('#productTitle').text().trim() ||
      $('h1').first().text().trim() ||
      sample.title;

    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('#landingImage').attr('src') ||
      $('img').first().attr('src') ||
      sample.image;

    const priceText =
      $('[itemprop="price"]').attr('content') ||
      $('.a-price .a-offscreen').first().text().trim() ||
      $('[data-testid="price"]:first').text().trim() ||
      $('meta[property="product:price:amount"]').attr('content');

    const ratingText =
      $('[itemprop="ratingValue"]').attr('content') ||
      $('#acrPopover').attr('title') ||
      $('[data-testid="overall-rating"]').first().text().trim();

    const reviewText =
      $('[itemprop="reviewCount"]').attr('content') ||
      $('#acrCustomerReviewText').text().trim() ||
      $('[data-testid="review-count"]').first().text().trim();

    const seller =
      $('#sellerProfileTriggerId').text().trim() ||
      $('[data-testid="seller-name"]').first().text().trim() ||
      sample.seller;

    const sellerVerified = /official|authorized|prime|certified|store/i.test(seller);

    return {
      sourceUrl: parsedUrl.href,
      marketplace,
      title,
      image,
      price: extractNumber(priceText, sample.price),
      currency: 'USD',
      seller: seller || 'Unknown seller',
      sellerVerified,
      rating: extractNumber(ratingText, sample.rating),
      reviewCount: Math.round(extractNumber(reviewText, sample.reviewCount)),
      reviewSummary:
        extractNumber(ratingText, sample.rating) >= 4.3
          ? 'Strong review sentiment with mostly positive buyer feedback.'
          : 'Mixed review sentiment; inspect recent feedback before purchasing.',
      scrapedLive: true
    };
  } catch (error) {
    return {
      sourceUrl: parsedUrl.href,
      marketplace,
      title: sample.title,
      image: sample.image,
      price: sample.price,
      currency: 'USD',
      seller: sample.seller,
      sellerVerified: sample.sellerVerified,
      rating: sample.rating,
      reviewCount: sample.reviewCount,
      reviewSummary: 'Fallback sample data used because the marketplace blocked live scraping or the request failed.',
      scrapedLive: false,
      scrapeWarning: error.message
    };
  }
}
