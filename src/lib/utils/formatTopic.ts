export function formatTopicLabel(topic: string): string {
  if (!topic || !topic.trim()) return "";
  const clean = topic.trim();
  const acronyms = new Set([
    "AWS",
    "CI/CD",
    "K8S",
    "DNS",
    "IP",
    "RBAC",
    "OSI",
    "SRE",
    "IT",
    "API",
    "CDK",
    "IAM",
  ]);

  if (acronyms.has(clean.toUpperCase())) {
    return clean.toUpperCase();
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}
