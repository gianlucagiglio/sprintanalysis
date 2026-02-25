/**
 * Cluster emails by sender.
 * Returns an array of sender objects sorted by email count (desc).
 */
export function clusterBySender(emails) {
  const map = new Map();

  for (const email of emails) {
    const senderEmail = extractEmail(email.from);
    const senderName = extractName(email.from);

    if (!map.has(senderEmail)) {
      map.set(senderEmail, {
        email: senderEmail,
        name: senderName,
        domain: extractDomain(senderEmail),
        count: 0,
        unread: 0,
        totalSize: 0,
        categories: {},
        firstDate: Infinity,
        lastDate: 0,
        messageIds: [],
        listUnsubscribe: null,
        subjects: [],
      });
    }

    const cluster = map.get(senderEmail);
    cluster.count++;
    cluster.messageIds.push(email.id);
    cluster.totalSize += email.sizeEstimate || 0;

    if (email.labelIds?.includes('UNREAD')) {
      cluster.unread++;
    }

    // Track category distribution
    if (email.category) {
      cluster.categories[email.category] = (cluster.categories[email.category] || 0) + 1;
    }

    const ts = email.internalDate;
    if (ts < cluster.firstDate) cluster.firstDate = ts;
    if (ts > cluster.lastDate) cluster.lastDate = ts;

    // Keep first unsubscribe link found
    if (!cluster.listUnsubscribe && email.listUnsubscribe) {
      cluster.listUnsubscribe = email.listUnsubscribe;
    }

    // Keep last 3 subjects for preview
    if (cluster.subjects.length < 3) {
      cluster.subjects.push(email.subject);
    }
  }

  // Determine primary category for each cluster
  const clusters = Array.from(map.values()).map((cluster) => {
    const entries = Object.entries(cluster.categories);
    cluster.category = entries.length
      ? entries.sort((a, b) => b[1] - a[1])[0][0]
      : 'personal';
    cluster.unreadRatio = cluster.count > 0 ? cluster.unread / cluster.count : 0;
    return cluster;
  });

  return clusters.sort((a, b) => b.count - a.count);
}

function extractEmail(from) {
  const match = from.match(/<(.+?)>/);
  return match ? match[1].toLowerCase() : from.toLowerCase().trim();
}

function extractName(from) {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  if (match) return match[1].trim();
  // No angle brackets — the whole thing is the email
  const emailMatch = from.match(/<(.+?)>/);
  return emailMatch ? from.replace(/<.+?>/, '').trim().replace(/"/g, '') : from.split('@')[0];
}

function extractDomain(email) {
  const parts = email.split('@');
  return parts[1] || '';
}
