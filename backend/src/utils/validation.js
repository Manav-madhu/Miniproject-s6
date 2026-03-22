const allowedHosts = ['amazon.', 'flipkart.', 'ebay.', 'walmart.', 'etsy.', 'bestbuy.'];

export function validateMarketplaceUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, message: 'A product URL is required.' };
  }

  try {
    const parsed = new URL(rawUrl);
    const isAllowed = allowedHosts.some((host) => parsed.hostname.includes(host));

    if (!['http:', 'https:'].includes(parsed.protocol) || !isAllowed) {
      return {
        valid: false,
        message: 'Enter a valid marketplace URL from Amazon, Flipkart, eBay, Walmart, Etsy, or Best Buy.'
      };
    }

    return { valid: true, parsedUrl: parsed };
  } catch {
    return { valid: false, message: 'The submitted text is not a valid URL.' };
  }
}
