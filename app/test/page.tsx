import { buildAllPairs } from '../../lib/pairs';
import contentData from '../../lib/content.json';
import type { ContentItem } from '../../lib/types';
import { TestRoundSandbox } from './TestRoundSandbox';

export default function TestPage() {
  const items = contentData.items as ContentItem[];
  const allPairs = buildAllPairs(items);
  const samplePair = allPairs.find((p) => p.type === 'marketplace');
  if (!samplePair) {
    return <main className="p-8">Нет доступной пары для рендера.</main>;
  }
  return <TestRoundSandbox pair={samplePair} />;
}
