import { marketplaceCatalog } from '../data/mockMarketplace.js';
import { analyzeWithGemini } from './gemini.js';
import { scrapeProductData } from './scraper.js';

function tokenize(text) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function getSimilarProducts(product) {
  const tokens = tokenize(product.title);
  const similar = marketplaceCatalog.filter((item) =>
    item.keywords.some((keyword) => tokens.includes(keyword)) || tokens.some((token) => item.title.toLowerCase().includes(token))
  );

  return similar.length > 0 ? similar : marketplaceCatalog.slice(0, 3);
}

function ruleBasedAssessment(product, similarProducts) {
  const averagePrice = Number(
    (similarProducts.reduce((sum, item) => sum + item.price, 0) / similarProducts.length).toFixed(2)
  );
  const priceDifference = Number((((product.price - averagePrice) / averagePrice) * 100).toFixed(2));
  const warnings = [];
  let riskScore = 0;

  if (product.price < averagePrice * 0.65) {
    warnings.push('Price is far below the average market rate.');
    riskScore += 45;
  }

  if (!product.sellerVerified || /unknown/i.test(product.seller)) {
    warnings.push('Seller is unverified or missing trusted marketplace signals.');
    riskScore += 25;
  }

  if (product.rating < 3.8 || product.reviewCount < 20) {
    warnings.push('Ratings or review volume are weaker than expected.');
    riskScore += 20;
  }

  if (!product.scrapedLive) {
    warnings.push('Live scraping was unavailable; result includes benchmark fallback data.');
    riskScore += 10;
  }

  let classification = 'Likely Legit';
  if (riskScore >= 60) classification = 'Fraud';
  else if (riskScore >= 30) classification = 'Suspicious';

  const confidence = Math.min(96, Math.max(52, 62 + riskScore / 2));

  return {
    averagePrice,
    priceDifference,
    warnings,
    ruleClassification: classification,
    ruleConfidence: Number(confidence.toFixed(1)),
    similarProducts
  };
}

function mergeAssessments(ruleResult, aiResult) {
  if (!aiResult) {
    return {
      classification: ruleResult.ruleClassification,
      confidence: ruleResult.ruleConfidence,
      explanation:
        'AI enrichment is unavailable because GEMINI_API_KEY is not configured. The result is based on market benchmarks, seller trust signals, and ratings heuristics.',
      warnings: ruleResult.warnings
    };
  }

  return {
    classification: aiResult.classification || ruleResult.ruleClassification,
    confidence: aiResult.confidence || ruleResult.ruleConfidence,
    explanation: aiResult.explanation,
    warnings: [...new Set([...(ruleResult.warnings || []), ...(aiResult.warnings || [])])]
  };
}

export async function analyzeListing(parsedUrl) {
  const product = await scrapeProductData(parsedUrl);
  const ruleResult = ruleBasedAssessment(product, getSimilarProducts(product));

  const aiPayload = {
    product,
    marketSnapshot: {
      averagePrice: ruleResult.averagePrice,
      priceDifferencePercent: ruleResult.priceDifference,
      similarProducts: ruleResult.similarProducts.map(({ title, price, seller, rating }) => ({
        title,
        price,
        seller,
        rating
      }))
    },
    heuristicWarnings: ruleResult.warnings
  };

  let aiResult = null;
  try {
    aiResult = await analyzeWithGemini(aiPayload);
  } catch (error) {
    aiResult = {
      classification: ruleResult.ruleClassification,
      confidence: ruleResult.ruleConfidence,
      explanation: `Gemini analysis failed, so the final verdict uses rule-based checks only. ${error.message}`,
      warnings: [...ruleResult.warnings, 'AI analysis fallback triggered due to upstream API error.']
    };
  }

  const finalAssessment = mergeAssessments(ruleResult, aiResult);

  return {
    ...product,
    averagePrice: ruleResult.averagePrice,
    priceDifference: ruleResult.priceDifference,
    similarProducts: ruleResult.similarProducts,
    fraudPrediction: finalAssessment.classification,
    confidence: finalAssessment.confidence,
    explanation: finalAssessment.explanation,
    warnings: finalAssessment.warnings,
    analysisTimestamp: new Date().toISOString()
  };
}
