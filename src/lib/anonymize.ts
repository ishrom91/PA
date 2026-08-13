/** Strip PII before writing to training_data */
export function anonymizeForTraining(text: string): string {
  let s = text;

  // Emails
  s = s.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/gi, '[email]');
  // Phone-like numbers
  s = s.replace(/(\+?\d[\d\s\-()]{8,}\d)/g, '[phone]');
  // Money amounts (rough)
  s = s.replace(/\d[\d\s]*(?:000|000\s*\d+|₽|\$|€|руб\.?)/gi, '[sum]');
  // URLs
  s = s.replace(/https?:\/\/\S+/gi, '[url]');
  // Capitalized multi-word sequences (possible names/companies) — conservative
  s = s.replace(/\b[А-ЯA-Z][а-яa-z]+(?:\s+[А-ЯA-Z][а-яa-z]+){1,2}\b/g, '[name]');

  return s.trim();
}

export function anonymizeContent(content: unknown): unknown {
  if (typeof content === 'string') return anonymizeForTraining(content);
  if (Array.isArray(content)) return content.map(anonymizeContent);
  if (content && typeof content === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(content)) {
      out[k] = anonymizeContent(v);
    }
    return out;
  }
  return content;
}
