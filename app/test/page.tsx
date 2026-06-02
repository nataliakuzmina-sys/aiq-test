import contentData from '../../lib/content.json';
import { buildAllPairs, selectSessionPairs, toPublic } from '../../lib/pairs';
import type { ContentItem } from '../../lib/types';
import { TestSession } from '../../components/TestSession';

// Серверный отбор пар на каждый запрос; источник `content.json` остаётся на
// сервере. Клиент получает только public-проекции (без source / type).
export const dynamic = 'force-dynamic';

export default function TestPage() {
  const items = contentData.items as ContentItem[];
  const sessionPairs = selectSessionPairs(buildAllPairs(items));
  const publicPairs = sessionPairs.map(toPublic);
  return <TestSession initialPairs={publicPairs} />;
}
