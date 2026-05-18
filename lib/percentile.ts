/**
 * Доля ранее сохранённых результатов со строго меньшим AIQ, в процентах (0–100).
 *
 * Возвращает `null`, если массив пустой — этот случай в UI отображается как
 * «среди первых N прошедших» (PRD: < 50 результатов → не показываем процентиль).
 *
 * Само сравнение строгое (`a < userAiq`), как в SQL-запросе из CLAUDE.md.
 */
export function computePercentile(
  userAiq: number,
  otherAiqs: readonly number[],
): number | null {
  if (otherAiqs.length === 0) return null;
  let lower = 0;
  for (const a of otherAiqs) {
    if (a < userAiq) lower++;
  }
  return Math.round((lower / otherAiqs.length) * 100);
}
