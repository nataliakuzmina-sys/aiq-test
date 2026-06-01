import type { BiasProfile } from '../lib/types';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  displayName: string;
  expertTitle: string | null;
  aiq: number;
  biasProfile: BiasProfile;
  isExpert: boolean;
  createdAt: string;
}

const BIAS_ICON: Record<BiasProfile, string> = {
  balanced: '⚖️',
  paranoid: '🔍',
  trusting: '🤝',
};

const BIAS_NAME: Record<BiasProfile, string> = {
  balanced: 'Сбалансированный',
  paranoid: 'Параноик',
  trusting: 'Доверчивый',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center text-text-secondary py-8 bg-background-display border border-border-selector rounded-sm">
        Пока никто не публиковал результаты. Будьте первым.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm md:text-base">
        <thead>
          <tr className="border-b-2 border-border-selector text-left text-sm text-text-secondary">
            <th className="py-2 px-3 w-12">#</th>
            <th className="py-2 px-3">Имя</th>
            <th className="py-2 px-3 w-20 text-right">AIQ</th>
            <th className="py-2 px-3 hidden sm:table-cell">Профиль</th>
            <th className="py-2 px-3 w-28 hidden md:table-cell">Дата</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b border-border-selector">
              <td className="py-3 px-3 font-mono tabular-nums text-text-secondary">
                {e.rank}
              </td>
              <td className="py-3 px-3">
                <div className="font-semibold">{e.displayName}</div>
                {e.isExpert && e.expertTitle && (
                  <div className="text-xs text-text-secondary">{e.expertTitle}</div>
                )}
              </td>
              <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-text-primary">
                {e.aiq}
              </td>
              <td className="py-3 px-3 hidden sm:table-cell">
                <span className="mr-1" aria-hidden="true">
                  {BIAS_ICON[e.biasProfile]}
                </span>
                {BIAS_NAME[e.biasProfile]}
              </td>
              <td className="py-3 px-3 text-text-secondary hidden md:table-cell">
                {formatDate(e.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
