export async function analyzeProduct(url) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Unable to analyze this product URL.');
  }

  return data;
}
