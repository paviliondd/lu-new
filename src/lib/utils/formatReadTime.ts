export function formatReadTime(readTime?: string): string {
  if (!readTime || !readTime.trim()) return "5 min read";
  const clean = readTime.trim();
  // If it's already in "min read" format, return as is
  if (/min\s+read/i.test(clean)) return clean;
  // Replace "phút đọc" or "phút" with "min read"
  const formatted = clean.replace(/phút\s*đọc|phút/gi, "min read");
  if (/min\s+read/i.test(formatted)) return formatted;
  // If only a number was provided, append "min read"
  if (/^\d+$/.test(clean)) return `${clean} min read`;
  return formatted;
}
