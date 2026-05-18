import contentData from '../../lib/content.json';
import { buildAllPairs, selectSessionPairs } from '../../lib/pairs';
import type { ContentItem } from '../../lib/types';
import { TestSession } from '../../components/TestSession';

// Без этой строки Next.js застатичит страницу на build и все
// пользователи получат одни и те же 8 пар, выбранные один раз.
// Force-dynamic заставляет рендер на каждый запрос.
export const dynamic = 'force-dynamic';

export default function TestPage() {
  const items = contentData.items as ContentItem[];
  const sessionPairs = selectSessionPairs(buildAllPairs(items));
  return <TestSession initialPairs={sessionPairs} />;
}
