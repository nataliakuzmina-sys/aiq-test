/**
 * Парсит файлы public/materials/ с именами {N}-{subcategory}-{modality}-{author}.{ext},
 * генерирует обезличенные пути (UUID-12), копирует файлы под новыми именами и
 * перезаписывает lib/content.json.
 *
 * Старые исходные имена остаются в директории — удалим отдельной командой после
 * проверки сгенерированного content.json. Это сделано намеренно: скрипт можно
 * запустить повторно, ничего не сломав.
 */

import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface ParsedFile {
  n: number;
  subcategory: string;
  modality: 'text' | 'image' | 'video' | 'audio';
  source: 'ai' | 'human';
  ext: string;
  originalName: string;
}

const MATERIALS_DIR = join(process.cwd(), 'public', 'materials');
const CONTENT_JSON = join(process.cwd(), 'lib', 'content.json');

const VALID_MODALITIES = new Set(['text', 'image', 'video', 'audio']);
// Format: {N}-{subcategory}-{modality}-{author}.{ext}
const PATTERN = /^(\d+)-([a-z]+)-([a-z]+)-(AI|human)\.([a-z0-9]+)$/i;

function parse(name: string): ParsedFile | null {
  const m = PATTERN.exec(name);
  if (!m) return null;
  const nStr = m[1] ?? '';
  const subcategory = (m[2] ?? '').toLowerCase();
  const modality = (m[3] ?? '').toLowerCase();
  const author = (m[4] ?? '').toLowerCase();
  const ext = (m[5] ?? '').toLowerCase();
  if (!VALID_MODALITIES.has(modality)) return null;
  return {
    n: parseInt(nStr, 10),
    subcategory,
    modality: modality as ParsedFile['modality'],
    source: author === 'ai' ? 'ai' : 'human',
    ext,
    originalName: name,
  };
}

function shortId(): string {
  return randomBytes(6).toString('hex'); // 12 hex chars
}

function main(): void {
  const all = readdirSync(MATERIALS_DIR);
  const parsed: ParsedFile[] = [];
  for (const f of all) {
    const p = parse(f);
    if (p) parsed.push(p);
  }
  parsed.sort((a, b) => a.n - b.n);

  console.log(`Parsed ${parsed.length} source files`);

  const usedIds = new Set<string>();
  const items: Record<string, unknown>[] = [];

  for (const p of parsed) {
    let id: string;
    do {
      id = shortId();
    } while (usedIds.has(id));
    usedIds.add(id);

    const newName = `${id}.${p.ext}`;
    const srcPath = join(MATERIALS_DIR, p.originalName);
    const dstPath = join(MATERIALS_DIR, newName);
    if (!existsSync(dstPath)) {
      copyFileSync(srcPath, dstPath);
    }

    const item: Record<string, unknown> = {
      id,
      type: p.subcategory,
      modality: p.modality,
      source: p.source,
    };

    if (p.modality === 'text') {
      const txt = readFileSync(srcPath, 'utf-8').trim();
      item.content = txt;
      // text не получает url — текст инлайн
    } else {
      item.url = `/materials/${newName}`;
    }
    items.push(item);
  }

  writeFileSync(CONTENT_JSON, JSON.stringify({ items }, null, 2), 'utf-8');
  console.log(`Wrote ${items.length} items to ${CONTENT_JSON}`);

  // Сводка
  const byType: Record<string, number> = {};
  const bySrc: Record<string, number> = {};
  for (const it of items) {
    byType[it.type as string] = (byType[it.type as string] ?? 0) + 1;
    bySrc[it.source as string] = (bySrc[it.source as string] ?? 0) + 1;
  }
  console.log('By subcategory:', byType);
  console.log('By source:', bySrc);
}

main();
