/** Common quick reactions (single Unicode graphemes / clusters). */
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

/**
 * @param {Array<{ user?: {_id?: string}, emoji?: string }>} reactions
 * @param {string} currentUserId
 */
export function groupReactionsForDisplay(reactions, currentUserId) {
  const map = new Map();
  const me = currentUserId != null ? String(currentUserId) : "";

  for (const r of reactions || []) {
    const emoji = r?.emoji;
    if (!emoji) continue;
    const uid = r.user?._id != null ? String(r.user._id) : r.user != null ? String(r.user) : "";
    if (!map.has(emoji)) {
      map.set(emoji, { count: 0, names: [], iReacted: false });
    }
    const g = map.get(emoji);
    g.count += 1;
    if (r.user?.name) g.names.push(r.user.name);
    if (me && uid === me) g.iReacted = true;
  }

  return Array.from(map.entries()).map(([emoji, data]) => {
    const names = [...new Set(data.names)];
    return {
      emoji,
      ...data,
      names,
      label: names.length ? names.join(", ") : "",
    };
  });
}
